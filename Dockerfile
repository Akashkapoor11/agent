# Build context: repo root.
#
# Backend image used by render.yaml Blueprint and docker-compose.
# Pure FastAPI — no bundled Postgres. The operator must provide a
# reachable PostgreSQL connection string via the DB_CON_STR env var.
#
# For the local stack, docker-compose.yml stands up a sibling `db`
# service and points DB_CON_STR at it. For Render, set DB_CON_STR
# in the Web Service's Environment tab.

FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY milan-be/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY milan-be/ /app/

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
