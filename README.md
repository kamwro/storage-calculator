# Storage Calculator

Small monorepo for planning how item types fit into storage containers under weight and volume constraints.

It includes:

- A NestJS backend with JWT auth, CRUD APIs, and packing strategy evaluation
- A React + Vite frontend for auth, item types, containers, and calculator flows
- Playwright API E2E tests
- Optional integration points for an external Cargo normalization service

## Monorepo Layout

- `backend/`
  - NestJS + TypeORM
  - Postgres in normal dev/prod flows
  - Optional SQLite in-memory mode for manual E2E workflow
- `frontend/`
  - React + Vite + Tailwind
- `e2e/`
  - Playwright API specs
  - UI project scaffold only for now
- `scripts/`
  - Seed helpers
- `ADR/`
  - Architecture decision records

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

The UI reads `VITE_API_BASE_URL` and defaults to `/api`.

Example:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

Notes:

- JWT is stored in `localStorage`
- API errors are normalized in `frontend/src/api.ts`
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

- `backend.yml`
  - lint, build, unit tests, SBOM, scan
- `frontend.yml`
  - lint, build, SBOM, scan
- `e2e.yml`
  - manual workflow
  - uses SQLite in-memory for the backend
  - builds backend/frontend
  - runs configured Playwright projects

## ADRs

Design decisions are documented in `ADR/`.

## License

MIT
