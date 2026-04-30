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

ENV POSTGRES_USER=milan \
    POSTGRES_PASSWORD=isi4ja8# \
    POSTGRES_DB=milan \
    PGDATA=/var/lib/postgresql/data

RUN apk add --no-cache python3 py3-pip build-base postgresql-dev

# Schema + seed auto-load on first init
COPY sql/milan-ddl.sql /docker-entrypoint-initdb.d/01-ddl.sql
COPY sql/milan-dml.sql /docker-entrypoint-initdb.d/02-dml.sql

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt
COPY . /app/

# Pre-built React FE — main.py serves it from /milan-fe/dist
COPY static-fe /milan-fe/dist

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/entrypoint.sh"]
