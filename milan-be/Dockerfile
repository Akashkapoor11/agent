# Build context: milan-be/ (Render Root Directory = milan-be).
#
# Single self-contained image bundling Postgres 16 + FastAPI. The FE is
# NOT bundled here because Docker cannot COPY from outside the build
# context (milan-fe/ lives at the repo root, outside this directory).
#
# Use this Dockerfile when you want a BE-only deploy on Render's
# existing Web Service that has Root Directory = milan-be. Pair it with
# a separate Static Site for the FE.
#
# For the all-in-one deploy (FE + BE + DB in one container), use
# /Dockerfile at the repo root with Root Directory left blank, or use
# the render.yaml Blueprint at New + → Blueprint.

FROM postgres:16-alpine

ENV POSTGRES_USER=milan \
    POSTGRES_PASSWORD=isi4ja8# \
    POSTGRES_DB=chitti_apps \
    PGDATA=/var/lib/postgresql/data

RUN apk add --no-cache python3 py3-pip build-base postgresql-dev

# Schema + seed auto-load on first init
COPY sql/milan-ddl.sql /docker-entrypoint-initdb.d/01-ddl.sql
COPY sql/milan-dml.sql /docker-entrypoint-initdb.d/02-dml.sql

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt
COPY . /app/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
