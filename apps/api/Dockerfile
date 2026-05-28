# Build from monorepo root: docker build -f apps/api/Dockerfile .
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm ci
RUN npm run build -w @filetransfer/api

FROM node:20-alpine AS runner
WORKDIR /app/apps/api

ENV NODE_ENV=production

COPY package.json package-lock.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/dist ./dist
COPY apps/api/src/db/schema.sql ./dist/db/schema.sql
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh \
	&& mkdir -p data/uploads

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
