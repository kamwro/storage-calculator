ARG NODE_VERSION=24.11.1-bookworm-slim
ARG PNPM_VERSION=10.26.1

FROM node:${NODE_VERSION} AS builder

ARG PNPM_VERSION
ENV NODE_ENV=build

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY backend/tsconfig*.json backend
COPY backend/nest-cli.json backend/nest-cli.json
COPY backend/src backend/src

RUN pnpm install --frozen-lockfile --ignore-scripts

RUN pnpm run build:backend

FROM node:${NODE_VERSION} AS runtime

ARG PNPM_VERSION
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

// TODO FIXME
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/package.json ./package.json

RUN pnpm install --prod --frozen-lockfile

ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "run", "start:backend"]
