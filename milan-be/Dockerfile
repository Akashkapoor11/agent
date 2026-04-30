# Build context: milan-be/ (Render Root Directory = milan-be).
#
# Self-contained image: Postgres 16 + FastAPI + the pre-built React FE.
# The FE is bundled here as static-fe/ (committed to the repo, regenerated
# from milan-fe/ via `npm run build` before each release).
#
# After deploy, the public URL serves both:
#   /milan-aegis-fe/   → React frontend
#   /milan-aegis/api/* → FastAPI backend
#   /                  → 302 → /milan-aegis-fe/

FROM postgres:16-alpine

# Postgres init credentials. Defaults are overridable at build or run
# time via standard ARG/ENV mechanics. The bundled Postgres only listens
# on 127.0.0.1 inside the container, so these are never exposed
# externally — but operators can still override in production:
#   docker build --build-arg POSTGRES_PASSWORD=$(openssl rand -hex 24) ...
ARG POSTGRES_USER=milan
ARG POSTGRES_PASSWORD=milan_dev_only
ARG POSTGRES_DB=milan
ENV POSTGRES_USER=$POSTGRES_USER \
    POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    POSTGRES_DB=$POSTGRES_DB \
    PGDATA=/var/lib/postgresql/data

RUN apk add --no-cache python3 py3-pip build-base postgresql-dev

# Schema + seed auto-load on first init
COPY sql/milan-ddl.sql /docker-entrypoint-initdb.d/01-ddl.sql
COPY sql/milan-dml.sql /docker-entrypoint-initdb.d/02-dml.sql

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt
COPY . /app/

# Backend-only build: FE is hosted separately as a Render Static Site
# (agent-1) or as a Kubernetes Service in the Aegis pipeline. main.py
# detects the missing /milan-fe/dist and returns JSON health/404 for
# all FE-style routes.

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
