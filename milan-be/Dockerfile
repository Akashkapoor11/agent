# Build context: repo root (see render.yaml / docker-compose.yml).
#
# One self-contained image bundling everything: Postgres 16 + FastAPI +
# the built React FE. Anyone who deploys this repo gets the whole stack
# from a single container — no separate database, no separate FE host,
# no rewrite rules, no environment variables to set.
#
# Stage 1 builds the FE with Vite. Stage 2 layers Python + Postgres on
# top and copies the built dist into the runtime image at the path
# milan-be/main.py expects.

# ---------- Stage 1: build the React/Vite frontend ----------
FROM node:22-alpine AS fe-builder
WORKDIR /fe

COPY milan-fe/package.json milan-fe/package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY milan-fe/ ./
# FE calls relative paths; both server-side BE routes and client-side
# router live behind /milan-aegis-fe/.
ENV VITE_API_URL=/milan-aegis/api
ENV BASE_PATH=/milan-aegis-fe/
RUN npm run build

# ---------- Stage 2: Postgres 16 + Python + bundled FE ----------
FROM postgres:16-alpine

# Postgres init env vars — read by the base image's docker-entrypoint.sh
ENV POSTGRES_USER=milan \
    POSTGRES_PASSWORD=isi4ja8# \
    POSTGRES_DB=chitti_apps \
    PGDATA=/var/lib/postgresql/data

# Python + build deps for psycopg2
RUN apk add --no-cache python3 py3-pip build-base postgresql-dev

# Auto-loaded by Postgres on first init (when /var/lib/postgresql/data is empty)
COPY milan-be/sql/milan-ddl.sql /docker-entrypoint-initdb.d/01-ddl.sql
COPY milan-be/sql/milan-dml.sql /docker-entrypoint-initdb.d/02-dml.sql

# FastAPI app
WORKDIR /app
COPY milan-be/requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt
COPY milan-be/ /app/

# Built FE goes where main.py's FE_DIST expects it (../milan-fe/dist
# relative to /app => /milan-fe/dist).
COPY --from=fe-builder /fe/dist /milan-fe/dist

# Custom entrypoint: starts Postgres, waits, launches uvicorn
COPY milan-be/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
