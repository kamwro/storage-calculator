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
- **TanStack Query** — `useQuery` for cached server reads, `useMutation` + `invalidateQueries` for automatic cache invalidation after creates/updates/deletes; no manual `refetch` plumbing
- **pnpm workspaces monorepo** — shared tooling, independent builds, root-level scripts for lint/build/test/format
- **Playwright E2E tests** — API surface covered (auth, CRUD, RBAC, calculator) using SQLite in-memory isolation; UI tests covering login flow and dashboard rendering
- **GitHub Actions CI** — per-service lint → build → unit test pipelines; E2E suite on every push to main; SBOM generation (Syft/SPDX) and vulnerability scanning (Grype → SARIF → GitHub Code Scanning) on every push

It includes:

- A NestJS backend with JWT auth, CRUD APIs, and packing strategy evaluation
- A Next.js 15 (App Router) + React 19 frontend with file-based routing, TanStack Query for data management
- Playwright API E2E tests + browser UI E2E tests
- Optional integration points for an external Cargo normalization service

---

## Getting started

### Demo credentials (created by the seed script)

| Role  | Username            | Password    |
| ----- | ------------------- | ----------- |
| admin | `admin@example.com` | `admin1234` |
| user  | `demo@example.com`  | `demo1234`  |

### Local setup — from scratch

```bash
# 1. Install all workspace dependencies
pnpm -w install

# 2. Copy and configure the backend env file
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET to any 32+ character string:
#   JWT_SECRET=any-random-string-at-least-32-chars-long

# 3. Start the database (Postgres via Docker, from repo root)
docker compose up -d db

# 4. Run migrations (wait ~5 s for Postgres to be healthy first)
pnpm --filter backend run migration:run

# 5. Seed demo users and data
pnpm --filter backend run seed

# 6. Start the backend (terminal 1) — listens on port 3000
pnpm --filter backend dev

# 7. Start the frontend (terminal 2) — listens on port 5173
pnpm --filter frontend dev
```

Access points:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api/docs`

### Demo flow

1. **Login** — open `http://localhost:5173`, log in as `demo@example.com` / `demo1234`
2. **Containers and item types** — the seed creates two containers (Container A / Container B) and three item types (Small Box / Medium Box / Large Box) visible immediately on the dashboard
3. **Run the calculator** — click "Add" in the Calculator panel, pick an item type and quantity, check one or both containers, select `best_fit_decreasing`, click Evaluate. Show the per-container breakdown and utilization percentages.
4. **RBAC / admin-only creation** — log out, log in as `admin@example.com` / `admin1234`. The "Add (admin)" button appears in the Item Types panel. Creating a new item type as a regular user returns 403.
5. **Swagger / API docs** — open `http://localhost:3000/api/docs` to show the full API surface with request/response schemas and bearer auth.

### Test commands

```bash
# Unit tests (backend, Jest)
pnpm --filter backend test

# Lint both packages
pnpm run lint:all

# Build both packages (TypeScript check included)
pnpm run build:all

# Playwright API E2E tests (requires backend running on port 3000)
pnpm run e2e:api

# Playwright UI E2E tests (requires both services running)
pnpm run e2e:ui

# All E2E tests
pnpm run e2e:all
```

### Common startup problems

| Problem                           | Likely cause                                       | Fix                                                         |
| --------------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| Backend crashes immediately       | `JWT_SECRET` not set or shorter than 32 characters | Edit `backend/.env`, set a 32+ char `JWT_SECRET`            |
| `ECONNREFUSED` on DB              | Postgres not running                               | `docker compose up -d db` from repo root                    |
| `relation "users" does not exist` | Migrations not run                                 | `pnpm --filter backend run migration:run`                   |
| Frontend shows blank / 401 loop   | Backend not running                                | Start backend first: `pnpm --filter backend dev`            |
| `docker compose` not found        | Old Docker version                                 | Use `docker-compose` (with hyphen) or update Docker Desktop |

---

## Known Production Hardening Items

- **JWT stored in `localStorage`** — readable by any JS on the page (XSS risk). Production fix: httpOnly + Secure + SameSite=Strict cookie set by the backend on login, paired with CSRF protection (double-submit cookie or synchronizer token pattern). See the TODO comment in `frontend/src/lib/api.ts`.
- **No structured logging** — the backend uses console output only. Production improvement: `nest-winston` or `pino-http` with correlation IDs per request.
- **Frontend not containerized** — only the backend has a `Dockerfile`. A Next.js multi-stage Docker build would complete the stack.
- **Rate limiting on auth endpoints only** — `@nestjs/throttler` is applied only to `/auth/*`. CRUD endpoints have no rate limit.
- **No API versioning** — all routes are at `/api/*` with no `/api/v1/` prefix.

---

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
  - `src/components/Providers.tsx` — TanStack Query `QueryClientProvider` wrapper
  - `src/types.ts` — shared domain types
  - `next.config.ts` — API rewrites (`/api/*` → NestJS backend)
- `e2e/`
  - `api/` — Playwright API specs (auth, containers, items, item-types, calculator, RBAC)
  - `ui/` — Playwright browser tests (login page, login flow, unauthenticated redirect)
- `scripts/`
  - Seed helpers
- `ADR/`
  - Architecture decision records (framework choices, auth model, CI tooling)

## Quickstart

### Prerequisites

- Node 24.x
- pnpm
- Docker (for local Postgres)

### Install

```bash
pnpm -w install
```

### Backend env

Copy `backend/.env.example` to `backend/.env` and set at least:

- `JWT_SECRET` — minimum 32 characters (enforced at startup)
- `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` — only needed if using your own Postgres

Optional:

- `PORT` defaults to `3000`
- `CORS_ORIGIN` defaults to `http://localhost:5173`
- `CARGO_URL`, `CARGO_API_KEY`, `CARGO_API_TOKEN`

### Run locally

```bash
# Start Postgres (from repo root)
docker compose up -d db

# Run migrations and seed
pnpm --filter backend run migration:run
pnpm --filter backend run seed

# Start services (two terminals)
pnpm --filter backend dev      # http://localhost:3000
pnpm --filter frontend dev     # http://localhost:5173
```

Swagger UI is available at `http://localhost:3000/api/docs` in development.

## API Overview

Base URL: `/api`

### Auth

- `POST /auth/register` → `{ username, password }` → `{ token, user }`
- `POST /auth/login` → `{ username, password }` → `{ token, user }`
- `GET /auth/me` → current JWT user

### Item Types

- `GET /item-types` — public, returns `{ data, total, offset, limit }`
- `POST /item-types` — admin only

### Containers

- `GET /containers` — JWT required, returns `{ data, total, offset, limit }`
- `GET /containers/:id`
- `POST /containers`
- `PATCH /containers/:id`
- `DELETE /containers/:id`
- `GET /containers/:id/summary`

### Items

- `GET /containers/:containerId/items` — returns `{ data, total, offset, limit }`
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

- JWT is stored in `localStorage` (see "Known Production Hardening Items" above)
- API errors are normalized in `frontend/src/lib/api.ts`
- Unauthenticated requests redirect to `/login` via `router.replace`
- TanStack Query manages data fetching and cache invalidation; no manual `refetch` calls needed after mutations

## Testing

### Local checks

```bash
pnpm run lint:all
pnpm --filter backend test -- --runInBand
pnpm run build:all
```

### Playwright E2E

```bash
pnpm run e2e:api    # API tests only
pnpm run e2e:ui     # Browser UI tests only
pnpm run e2e:all    # All tests
```

Notes:

- API specs create their own users via the register endpoint; no pre-seeded data needed
- UI specs register a user via API then exercise the browser login flow
- Both suites work against SQLite in-memory in CI (no external database needed)

Environment overrides:

- `API_BASE_URL` defaults to `http://localhost:3000/api`
- `UI_BASE_URL` defaults to `http://localhost:5173`

## Docker

### Local development (database only)

`docker-compose.yml` at the repo root starts only Postgres. The backend and frontend run natively with `pnpm dev`.

```bash
# From repo root
docker compose up -d db
docker compose down
```

### Full Dockerized deployment (api + db)

`backend/docker-compose.yml` builds and starts the NestJS API container alongside Postgres.

```bash
cd backend
docker compose up --build
```

Compose-provided backend defaults:

- `DB_HOST=db`
- `DB_PORT=5432`
- `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` (from `.env`)

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
- `e2e.yml` — triggered on push/PR to main and manually via `workflow_dispatch`
  - configures backend with SQLite in-memory (no external database dependency)
  - builds and starts both services, waits for readiness
  - runs all Playwright projects (API + UI) and uploads artifacts

## ADRs

Design decisions are documented in `ADR/`.

## License

MIT
