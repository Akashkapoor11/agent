# Build context: milan-be/ (Render Root Directory = milan-be).
#
# Single self-contained image: Postgres 16 + FastAPI in one container.
# The bundled DDL/DML auto-loads on first startup via Postgres' built-in
# /docker-entrypoint-initdb.d hook. The entrypoint forces DB_CON_STR to
# localhost so the BE always talks to its embedded database — any
# DB_CON_STR set in Render env vars is intentionally ignored.
#
# Trade-off: data is ephemeral (resets on container restart), but since
# the seed is bundled and idempotent, every cold start brings the demo
# back to the same known-good state. No external DB account required.

FROM postgres:16-alpine

# Postgres init env vars — read by the base image's docker-entrypoint.sh
ENV POSTGRES_USER=milan \
    POSTGRES_PASSWORD=isi4ja8# \
    POSTGRES_DB=chitti_apps \
    PGDATA=/var/lib/postgresql/data

# Python + build deps for psycopg2 (compiled against postgresql-dev)
RUN apk add --no-cache python3 py3-pip build-base postgresql-dev netcat-openbsd

# Auto-loaded on first DB init (when /var/lib/postgresql/data is empty)
COPY sql/milan-ddl.sql /docker-entrypoint-initdb.d/01-ddl.sql
COPY sql/milan-dml.sql /docker-entrypoint-initdb.d/02-dml.sql

# FastAPI app
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt
COPY . /app/

# Custom entrypoint: starts Postgres in background, waits for ready,
# then runs uvicorn in foreground.
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
