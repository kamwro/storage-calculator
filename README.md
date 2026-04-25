# Storage Calculator

TypeScript/NestJS + React monorepo for planning how item types fit into storage containers under
weight and volume constraints. Built as a portfolio project demonstrating full-stack TypeScript
architecture, clean design patterns, and production-grade CI/CD practices.

## What This Project Demonstrates

- **Modular NestJS architecture** — clean module boundaries, DI, DTOs, global validation pipe, Swagger docs
- **JWT/RBAC authentication** — Passport JWT strategy, `@Roles` decorator, ownership-scoped queries
- **Strategy Pattern** — bin-packing heuristics (`first_fit`, `best_fit`, `best_fit_decreasing`) as typed functions behind a `strategyMap` dispatch; adding a strategy requires editing one file
- **Clean architecture lite** — service interfaces (ports) in `core/ports/`, business logic in `core/use-cases/`, DI tokens separating contract from implementation
- **Next.js 15 App Router** — file-based routing (`/login`, `/dashboard`), `next.config.ts` API rewrites proxying to NestJS, all components Client Components (interactive/stateful app)
- **pnpm workspaces monorepo** — shared tooling, independent builds, root-level scripts for lint/build/test/format
- **Playwright E2E tests** — full API surface covered (auth, CRUD, RBAC, calculator) using SQLite in-memory isolation
- **GitHub Actions CI** — per-service lint → build → unit test pipelines; SBOM generation (Syft/SPDX) and vulnerability scanning (Grype → SARIF → GitHub Code Scanning) on every push

It includes:

- A NestJS backend with JWT auth, CRUD APIs, and packing strategy evaluation
- A Next.js 15 (App Router) + React 19 frontend with file-based routing, all pages as Client Components
- Playwright API E2E tests
- Optional integration points for an external Cargo normalization service

## Monorepo Layout

- `backend/`
  - NestJS + TypeORM
  - Postgres in normal dev/prod flows
  - Optional SQLite in-memory mode for E2E / CI
  - Notable sub-directories:
    - `src/calculator/` — Strategy Pattern implementation (strategies.ts + strategyMap)
    - `src/core/ports/` — service interfaces (clean architecture boundaries)
    - `src/core/use-cases/` — business logic classes independent of infrastructure
    - `src/infra/postgres/` — TypeORM entities, migrations, DataSource
    - `src/shared/http/` — global error filter normalising all responses
- `frontend/`
  - Next.js 15 (App Router) + React 19 + TailwindCSS 4
  - Routes: `/` → `/dashboard` (redirect), `/login`, `/dashboard`
  - `src/lib/api.ts` — Axios instance with auth + error interceptors
  - `src/hooks/useFetch.ts` — generic typed data-fetching hook
  - `src/types.ts` — shared domain types
  - `next.config.ts` — API rewrites (`/api/*` → NestJS backend)
- `e2e/`
  - Playwright API specs (auth, containers, items, item-types, calculator, RBAC)
  - UI project scaffold only for now
- `scripts/`
  - Seed helpers
- `ADR/`
  - Architecture decision records (framework choices, auth model, CI tooling)

## Quickstart

### Prerequisites

- Node 24.x
- pnpm
- Docker, if you want local Postgres via Compose

### Install

```bash
pnpm -w install
```

### Backend env

Copy `backend/.env.example` to `backend/.env` and set at least:

- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`

Optional:

- `PORT` defaults to `3000`
- `CORS_ORIGIN` defaults to `http://localhost:5173`
- `CARGO_URL`, `CARGO_API_KEY`, `CARGO_API_TOKEN`

### Run locally

```bash
pnpm --filter backend dev
pnpm --filter frontend dev
```

### Database

If Postgres is already available, run:

```bash
pnpm --filter backend run migration:run
pnpm --filter backend run seed
```

If you want Postgres through Docker Compose:

```bash
cd backend
docker compose up --build
```

Then run migrations and seed from another shell:

```bash
pnpm --filter backend run migration:run
pnpm --filter backend run seed
```

Swagger UI is available at:

```text
http://localhost:3000/api/docs
```

## API Overview

Base URL: `/api`

### Auth

- `POST /auth/register` -> `{ username, password }` -> `{ token, user }`
- `POST /auth/login` -> `{ username, password }` -> `{ token, user }`
- `GET /auth/me` -> current JWT user

### Item Types

- `GET /item-types`
  - Public
  - Returns `{ data, total, offset, limit }`
- `POST /item-types`
  - Admin only

### Containers

- `GET /containers`
  - JWT required
  - Returns `{ data, total, offset, limit }`
- `GET /containers/:id`
- `POST /containers`
- `PATCH /containers/:id`
- `DELETE /containers/:id`
- `GET /containers/:id/summary`

### Items

- `GET /containers/:containerId/items`
  - Returns `{ data, total, offset, limit }`
- `POST /containers/:containerId/items`
- `PATCH /items/:id`
- `DELETE /items/:id`

### Calculator

- `POST /calculator/evaluate`

Request shape:

```json
{
  "items": [{ "itemTypeId": "uuid", "quantity": 12 }],
  "containers": ["container-uuid-1", "container-uuid-2"],
  "strategy": "first_fit"
}
```

Supported strategies:

- `first_fit`
- `best_fit`
- `best_fit_decreasing`
- `bfd`
- `single_container_only`

Non-admin users can only evaluate with containers they own. Admins can evaluate with any containers.

## Calculator Notes

Current demo safeguards:

- Up to 100 requested item rows
- Up to 100 containers per request

Strategy summary:

- `first_fit`: first container that can accept the next unit
- `best_fit`: minimize the max remaining capacity ratio after placement
- `best_fit_decreasing` / `bfd`: sort larger items first, then apply best-fit
- `single_container_only`: succeeds only when one container can hold the full request

## Seeding

### Backend seed script

```bash
pnpm --filter backend run seed
```

This clears and recreates demo data:

- Admin user: `admin@example.com` / `admin1234`
- Demo user: `demo@example.com` / `demo1234`
- Three item types
- Two demo containers
- Sample items in those containers

### HTTP seed helper

The helper logs in and seeds through the public API surface.

```bash
set BACKEND_URL=http://localhost:3000/api
set SEED_USERNAME=admin@example.com
set SEED_PASSWORD=admin1234

python ./scripts/seed.py
```

Defaults:

- `BACKEND_URL=http://localhost:3000/api`
- `SEED_USERNAME=admin@example.com`
- `SEED_PASSWORD=admin1234`

## Frontend

In development, the Next.js dev server proxies `/api/*` to the backend via `next.config.ts` rewrites.
No extra env config is needed for local development.

For deployments where frontend and backend are on separate origins, set:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api
```

Notes:

- JWT is stored in `localStorage`
- API errors are normalized in `frontend/src/lib/api.ts`
- Unauthenticated requests redirect to `/login` via `router.replace`
- The UI unwraps paginated responses by reading `response.data.data ?? response.data`

## Testing

### Local checks

```bash
pnpm run lint:all
pnpm --filter backend test -- --runInBand
pnpm run build:all
```

### Playwright E2E

```bash
pnpm run e2e:api
pnpm run e2e:ui
pnpm run e2e:all
```

Notes:

- `e2e:ui` is a placeholder command and currently passes with no tests
- API specs create their own users
- API E2E writes into the configured backend database unless you use the GitHub workflow

Environment overrides:

- `API_BASE_URL` defaults to `http://localhost:3000/api`
- `UI_BASE_URL` defaults to `http://localhost:5173`

## Docker Compose

`backend/docker-compose.yml` starts:

- `api`
- `db` (Postgres 18)

Compose-provided backend defaults:

- `DB_HOST=db`
- `DB_PORT=5432`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`

The Postgres service uses the named volume `postgres-data`.

## External Cargo Service

An external service can normalize incoming raw data before it is pushed into this system.

Backend env:

- `CARGO_URL`
- `CARGO_API_KEY`
- `CARGO_API_TOKEN` optional

The backend sends:

- `X-CARGO-API-KEY`
- `Authorization: Bearer <token>` when `CARGO_API_TOKEN` is set

Reference implementation lives in the external repository:

```text
https://github.com/kamwro/cargo-processor
```

## Scripts

- `pnpm run lint:all`
- `pnpm run build:all`
- `pnpm run format`
- `pnpm run e2e:api`
- `pnpm run e2e:ui`
- `pnpm run e2e:all`
- `scripts/seed.sh`
- `scripts/seed.py`

## Git Hooks

Husky is configured with:

- `pre-commit`: runs `pnpm format`

Install hooks with:

```bash
pnpm install
```

## CI

GitHub Actions workflows:

- `backend.yml` — triggered on push/PR to main
  - lint → build → unit tests → SBOM (Syft/SPDX) → Grype vulnerability scan → upload SARIF to GitHub Code Scanning
- `frontend.yml` — triggered on push/PR to main
  - lint → build → SBOM (Syft/SPDX) → Grype vulnerability scan → upload SARIF
- `e2e.yml` — triggered manually via `workflow_dispatch`
  - configures backend with SQLite in-memory (no external database dependency)
  - builds and starts both services, waits for readiness
  - runs all Playwright projects and uploads artifacts

The E2E workflow is intentionally manual: API E2E specs write into the backend database, so
they need a clean, isolated DB (SQLite in-memory). Running them on every push would require
either a dedicated test DB or Docker service containers; the current design favours simplicity
for a demo project.

## ADRs

Design decisions are documented in `ADR/`.

## License

MIT
