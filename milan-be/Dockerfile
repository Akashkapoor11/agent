# Build context: repo root (see docker-compose.yml).
# Stage 1 builds the FE into milan-fe/dist; stage 2 runs FastAPI on :5000
# and serves that dist from the same process.

FROM node:22-alpine AS fe-builder
WORKDIR /fe
COPY milan-fe/package.json milan-fe/package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY milan-fe/ ./
ARG VITE_API_URL=/milan-aegis/api
ENV VITE_API_URL=$VITE_API_URL
ARG BASE_PATH=/milan-aegis-fe/
ENV BASE_PATH=$BASE_PATH
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

COPY milan-be/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY milan-be/ /app/
COPY --from=fe-builder /fe/dist /milan-fe/dist

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
