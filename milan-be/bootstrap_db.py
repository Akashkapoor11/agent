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

    with engine.connect() as conn:
        print("Ensuring pgcrypto extension exists...")
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))

        print(f"Applying {DDL_PATH}...")
        with open(DDL_PATH, "r", encoding="utf-8") as f:
            conn.execute(text(f.read()))

        print(f"Applying {DML_PATH}...")
        with open(DML_PATH, "r", encoding="utf-8") as f:
            conn.execute(text(f.read()))

        conn.commit()

    print("Bootstrap complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
