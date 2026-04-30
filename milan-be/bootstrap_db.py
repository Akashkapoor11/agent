"""One-shot database bootstrap for Milan Aegis.

Run this ONCE against a fresh Postgres to create the `milan` schema and
seed the read-only baseline data. Both SQL files are idempotent, so
re-running is safe but unnecessary.

Usage (from the milan-be/ directory, with DB_CON_STR set):

    python bootstrap_db.py

This is intentionally a manual CLI step — it is NOT wired into FastAPI
startup, so the running web service never mutates the production DB
without your explicit invocation.
"""
import os
import sys

from database import engine
from sqlalchemy import text


SQL_DIR = os.path.join(os.path.dirname(__file__), "sql")
DDL_PATH = os.path.join(SQL_DIR, "milan-ddl.sql")
DML_PATH = os.path.join(SQL_DIR, "milan-dml.sql")


def main() -> int:
    if not (os.path.isfile(DDL_PATH) and os.path.isfile(DML_PATH)):
        print(f"SQL files missing in {SQL_DIR}", file=sys.stderr)
        return 1

    # Use the underlying psycopg2 connection directly. SQLAlchemy's
    # text() parses ':name' as bind parameters and chokes on PostgreSQL
    # cast syntax like '::TIMESTAMP' that appears throughout the DML.
    # Raw cursor.execute sidesteps that entirely.
    with engine.connect() as sa_conn:
        raw = sa_conn.connection
        cur = raw.cursor()

        # database.py sets search_path to 'milan' on connect (so FastAPI
        # queries find tables without a schema prefix). On a fresh DB
        # that schema does not exist yet, which makes CREATE EXTENSION
        # fail with "no schema has been selected to create in". Reset
        # the search_path so the extension lands in 'public' and the
        # DDL then creates the milan schema cleanly.
        cur.execute("SET search_path TO public")

        print("Ensuring pgcrypto extension exists...")
        cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

        print(f"Applying {DDL_PATH}...")
        with open(DDL_PATH, "r", encoding="utf-8") as f:
            cur.execute(f.read())

        print(f"Applying {DML_PATH}...")
        with open(DML_PATH, "r", encoding="utf-8") as f:
            cur.execute(f.read())

        raw.commit()
        cur.close()

    print("Bootstrap complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
