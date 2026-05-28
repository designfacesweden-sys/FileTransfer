# Build from monorepo root: docker build -f apps/web/Dockerfile .
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm ci

WORKDIR /app/apps/web
ARG PUBLIC_API_URL=http://localhost:3001
ENV PUBLIC_API_URL=${PUBLIC_API_URL}
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/build ./build

EXPOSE 3000
CMD ["node", "build"]
