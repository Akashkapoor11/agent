# Build context: milan-be/ (Render Root Directory = milan-be).
#
# Pure FastAPI backend. No bundled Postgres — the operator must provide
# a reachable PostgreSQL connection string via the DB_CON_STR env var
# (URL form 'postgresql://user:pass@host:5432/dbname' or libpq DSN).
#
# Schema + seed are NOT auto-applied. Run them once against a fresh DB:
#   psql "$DB_CON_STR" -f sql/milan-ddl.sql
#   psql "$DB_CON_STR" -f sql/milan-dml.sql
# (or: python bootstrap_db.py from inside the container)

FROM python:3.11-slim

# Build-time deps for psycopg2 wheel; libpq for runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
