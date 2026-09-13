# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN test "$(yarn --version)" = "1.22.22"
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --non-interactive

FROM dependencies AS source
COPY . .
ARG APP_REVISION=desarrollo
ARG PUBLIC_SENTRY_DSN=""
ENV NODE_ENV=production APP_REVISION=${APP_REVISION} PUBLIC_SENTRY_DSN=${PUBLIC_SENTRY_DSN}

FROM source AS ci
RUN yarn lint

FROM source AS builder
RUN yarn build:dll && yarn build && node build/version.js

FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:442753882674b49ae2c1de83ed67896131c0777f56df5005e356e62bc3f7e7ce AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
ARG APP_REVISION=desarrollo
LABEL org.opencontainers.image.source="https://github.com/incubadoradesarrollo-source/F-LIZARD-JUDGE" \
      org.opencontainers.image.revision="${APP_REVISION}"
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
