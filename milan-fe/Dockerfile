# Self-contained FE image for the Aegis AKS pipeline. Build context is
# milan-fe/. The Aegis pipeline only ships this folder; everything below
# resolves to files inside milan-fe/.
#
# Build:  docker build -t milan-aegis-fe \
#             --build-arg VITE_API_URL=/milan-aegis/api \
#             --build-arg BASE_PATH=/milan-aegis-fe/ .
# Run:    docker run -d --name milan-aegis-fe -p 5000:5000 milan-aegis-fe

# --- Build: install deps and produce static dist/ ---
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (better layer cache)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .

# Vite inlines VITE_* at build time only. The default points at the
# nginx proxy path (/milan-aegis/api/) which this same container also
# serves and forwards to milan-be.
ARG VITE_API_URL=/milan-aegis/api
ENV VITE_API_URL=$VITE_API_URL

# Ingress prefix where the SPA is mounted. Must end with a trailing
# slash. Lowercase to match BE routes and nginx proxy_pass.
ARG BASE_PATH=/milan-aegis-fe/
ENV BASE_PATH=$BASE_PATH

RUN npm run build

# --- Run: static files only (small image, no Node in production) ---
FROM nginx:1.27-alpine AS runner

# default.conf.template uses ${MILAN_BE_UPSTREAM} which the nginx alpine
# base image substitutes at startup via 20-envsubst-on-templates.sh.
# Override the env var per-environment to point nginx at the BE.
ENV MILAN_BE_UPSTREAM=milan-be:5000

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]
