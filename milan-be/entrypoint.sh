#!/bin/sh
# Boot the bundled Postgres, wait for it to accept connections, then
# launch FastAPI. Forces DB_CON_STR to point at the local socket so
# any externally-set value (e.g. a stale Render env var) is ignored.

set -e

# Run the official postgres entrypoint in the background. It handles
# initdb on first start and auto-applies anything in
# /docker-entrypoint-initdb.d/.
docker-entrypoint.sh postgres &
POSTGRES_PID=$!

# Wait until Postgres accepts connections. The init scripts run between
# initdb and the "ready to accept connections" log line.
echo "[entrypoint] waiting for postgres..."
for i in $(seq 1 60); do
    if pg_isready -h 127.0.0.1 -U milan -d milan > /dev/null 2>&1; then
        echo "[entrypoint] postgres ready"
        break
    fi
    sleep 1
done

# Force DB_CON_STR to the bundled instance regardless of what the host
# environment set. This makes the deploy resilient to operator typos.
export DB_CON_STR="host=127.0.0.1 port=5432 dbname=milan user=milan password=isi4ja8#"

# Forward signals so SIGTERM cleanly stops both processes.
trap 'kill -TERM "$POSTGRES_PID" "$UVICORN_PID" 2>/dev/null; wait' TERM INT

cd /app
echo "[entrypoint] starting uvicorn on :5000"
python3 -m uvicorn main:app --host 0.0.0.0 --port 5000 &
UVICORN_PID=$!

wait "$UVICORN_PID"
