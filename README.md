# Milan Aegis — IT Log Intelligence

Read-only analysis dashboard over a security log baseline. Single Docker
image bundles Postgres 16, the FastAPI backend, and the built React
frontend together — one container, one URL, one deploy.

## Deploy on Render (zero config)

1. Sign in to https://dashboard.render.com.
2. Click **New +** → **Blueprint**.
3. Connect this GitHub repository.
4. Render reads `render.yaml`, creates the Web Service, builds the
   image, and starts the container. Build takes ~5 minutes.
5. Open the public URL Render assigns (e.g.
   `https://milan-aegis-xxxx.onrender.com`).

You should see the Milan Aegis dashboard with **18 events,
10 anomalies**, real users (`akash.kapoor@company.com`,
`priya.sharma@company.com`, …), Login Activity chart, Risk Distribution
donut, alerts, summary, and audit pages — all populated from the
seeded Postgres inside the container.

No environment variables. No external database. No rewrite rules.
Nothing to click in the dashboard after deploy.

## Run locally

```bash
docker compose up
```

Open http://localhost:5000.

## Architecture

| Layer | Where |
|---|---|
| React + Vite frontend | Built in `milan-be/Dockerfile` stage 1, served by FastAPI at `/milan-aegis-fe/` |
| FastAPI backend | `milan-be/main.py`, `:5000` inside the container |
| Postgres 16 | Same container, listens on `127.0.0.1:5432` |
| Schema + seed | `milan-be/sql/milan-ddl.sql` + `milan-be/sql/milan-dml.sql`, auto-loaded on first start |

The entrypoint (`milan-be/entrypoint.sh`) starts Postgres, waits for it
to accept connections, then launches uvicorn. The bundled `DB_CON_STR`
points the app at `127.0.0.1:5432` regardless of any external value.
