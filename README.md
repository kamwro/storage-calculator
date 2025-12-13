Project Overview

This is a small monorepo that helps plan how items fit into storage containers under both weight and volume constraints. It exposes a simple REST API for auth, CRUD over entities, and a calculator that tries to allocate items to containers using pluggable strategies. A lightweight React frontend drives the APIs, and an optional Python GraphQL service can normalize external data before it’s pushed into the system.

Monorepo layout

- Backend (NestJS + TypeORM + Postgres): `backend/`
  - Auth (JWT), Users, Item Types, Containers, Items
  - Calculator endpoint implementing `first_fit`, `best_fit`, and `single_container_only`
  - DB migrations + seed script
- Frontend (React + Vite + Tailwind): `frontend/`
  - Screens for auth, item types, containers + items, and the calculator
- Python Cargo Processor (FastAPI + Strawberry GraphQL): `python/`
  - Optional service to ingest/normalize raw data into item types and items

How pieces fit together

- The frontend talks to the backend at `/api`.
- The backend persists data in Postgres and exposes calculator logic.
- Tools or backend (future) can call the Python service to normalize incoming data, then create item types/items via the backend API.

Quickstart (dev)

1. Install prerequisites: Node 24.x, pnpm, Docker (for Postgres), Python 3.11+ (optional for the Python service).
2. Install deps: `pnpm install`
3. Backend env: copy `backend/.env.example` → `backend/.env` and set DB\_\*, JWT_SECRET
4. Start services:
   - Backend: `pnpm --filter backend dev`
   - Frontend: `pnpm --filter frontend dev`
5. Database:
   - Run migrations: `pnpm --filter backend run migration:run`
   - Seed demo data: `pnpm --filter backend run seed` (or use `scripts/seed.py`)

API Overview

Base URL: `/api`

Auth

- POST `/auth/register` → `{ email, password }`
- POST `/auth/login` → `{ email, password }` → `{ accessToken }`
- GET `/auth/me` (JWT) → current user

Item Types

- GET `/item-types`
- POST `/item-types` (admin)
  - `{ name, unitWeightKg, unitVolumeM3, lengthM?, widthM?, heightM? }`

Containers

- GET `/containers`
- GET `/containers/:id`
- POST `/containers` → `{ name, maxWeightKg, maxVolumeM3 }`
- PATCH `/containers/:id`
- DELETE `/containers/:id`
- GET `/containers/:id/summary` → totals and utilization

Items

- GET `/containers/:containerId/items`
- POST `/containers/:containerId/items` → `{ itemTypeId, quantity, note? }`
- PATCH `/items/:id`
- DELETE `/items/:id`

Calculator

- POST `/calculator/evaluate`

Auth & ownership:

- Requires JWT (authenticated request).
- Non-admin users may only evaluate using containers they own; admins can evaluate with any containers.

Request:

```
{
  "items": [ { "itemTypeId": "uuid", "quantity": 12 } ],
  "containers": [ "container-uuid-1", "container-uuid-2" ],
  "strategy": "first_fit" | "best_fit" | "single_container_only"
}
```

Response:

```
{
  "feasible": true,
  "byContainer": [
    {
      "containerId": "...",
      "totalWeightKg": 120.5,
      "totalVolumeM3": 0.85,
      "utilization": { "weightPct": 0.76, "volumePct": 0.54 },
      "items": [ { "itemTypeId": "...", "quantity": 12 } ]
    }
  ],
  "unallocated": [ { "itemTypeId": "...", "quantity": 3 } ]
}
```

Calculator strategies and limits

- Limits: up to 100 items and 100 containers per request (demo safeguard).
- `first_fit`: items are allocated unit‑by‑unit to the first container that can fit the next unit by both weight and volume. Fast, simple, not optimal.
- `best_fit` (combined score): for each unit, pick the container that minimizes the maximum of the remaining capacity ratios for weight and volume after a hypothetical placement. Lower score is better; this tends to balance weight and volume utilization.
- `single_container_only`: succeed only if the entire set fits into one container.

Example of `best_fit` combined scoring

```
Container A: maxWeightKg=100, maxVolumeM3=1.0, current usedW=60, usedV=0.4
Container B: maxWeightKg=80,  maxVolumeM3=0.8, current usedW=30, usedV=0.1

Placing 1 unit of an item: unitWeightKg=10, unitVolumeM3=0.2

If placed in A:
  newW=70, newV=0.6
  remaining weight ratio = (100-70)/100 = 0.30
  remaining volume ratio = (1.0-0.6)/1.0 = 0.40
  score = max(0.30, 0.40) = 0.40

If placed in B:
  newW=40, newV=0.3
  remaining weight ratio = (80-40)/80 = 0.50
  remaining volume ratio = (0.8-0.3)/0.8 = 0.625
  score = max(0.50, 0.625) = 0.625

Choose A (lower score = 0.40), as it better balances remaining capacities.
```

Seeding demo data

You can auto‑seed in dev by setting `SEED_ON_START=true` in `backend/.env` (optional), or run a one‑off seed script:

```
pnpm --filter backend run seed
```

Seed content:

- Users: admin (`admin@example.com`) and demo (`demo@example.com`)
- Item types: Small/Medium/Large Box with `unitWeightKg`, `unitVolumeM3`, and dimensions
- Containers: A/B with `maxWeightKg`, `maxVolumeM3`
- Items: few sample rows per container

Seeding via Python helper (calls Backend HTTP API)

If you prefer to seed through the HTTP API (and verify auth + guards), use the Python helper:

```
# Optionally set custom backend URL and credentials (admin by default)
set BACKEND_URL=http://localhost:3000/api
set SEED_USERNAME=admin@example.com
set SEED_PASSWORD=admin1234

python ./scripts/seed.py
```

Environment variables (with defaults):

- `BACKEND_URL` (default `http://localhost:3000/api`)
- `SEED_USERNAME` (default `admin@example.com`)
- `SEED_PASSWORD` (default `admin1234`)

Frontend (React + Vite)

Pages/components (planned):

- Auth (login/register)
- Item Types manager: list/create/update/delete (admin for mutating ops)
- Containers: list/detail; detail shows Items table + summary card (weight/volume/utilization)
- Calculator: form to pick items and containers, strategy selector, results panel

Design goals: simple, responsive, “pretty enough” with minimal CSS (e.g., Tailwind or lightweight component lib). PRs welcome.

Python service (Cargo Processor)

I include a small Python service exposing a GraphQL mutation to ingest raw data and return normalized Item Types/Items. Tools (or the backend) authenticate via a service key header.

GraphQL sketch:

```
type ItemTypeInput { name: String!, unitWeightKg: Float!, unitVolumeM3: Float!, lengthM: Float, widthM: Float, heightM: Float }
type ItemInput { itemTypeName: String!, quantity: Int! }
type NormalizeResult { itemTypes: [ItemTypeInput!]!, items: [ItemInput!]! }
type Mutation { normalize(source: String!, payload: JSON!): NormalizeResult! }
```

Where to find it:

- App: `python/main.py` (FastAPI + Strawberry GraphQL)
- Env sample: `python/.env.sample` (set `X_CARGO_PROCESSOR_API_KEY`)
- Dockerfile: `python/Dockerfile`
- Example client: `python/examples/post_demo_payload.py`

Run locally (without Docker):

```
cd python
cp .env.sample .env
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Send a demo request:

```
set CARGO_PROCESSOR_URL=http://localhost:8000
set X_CARGO_PROCESSOR_API_KEY=dev-key
python python/examples/post_demo_payload.py
```

Roadmap

- [x] Containers, Item Types, Items entities and basic APIs
- [x] Calculator with `first_fit` and `best_fit`
- [ ] RBAC and auth polish (roles, guards), ownership scoping
- [ ] Seed data + scripts and docs
- [ ] Frontend wiring for Items, summary, calculator
- [ ] Python GraphQL service + integration stub
- [ ] Docker deployment for backend + Postgres (and later frontend + Python service)

Deployment (Docker Compose)

Backend + Postgres + Cargo Processor (from `backend/` directory):

```
cp backend/.env.example backend/.env
# Adjust DB_* and JWT_SECRET as needed
cd backend
docker compose up --build
```

Defaults used by the backend container (set via compose):

- DB_HOST=db, DB_PORT=5432
- DB_USER, DB_PASS, DB_NAME (from `backend/.env`)

Once services are up:

- Run migrations (inside your dev shell): `pnpm --filter backend run migration:run`
- Seed data: `pnpm --filter backend run seed` or `./scripts/seed.sh`

Cargo Processor service:

- Exposed at `http://localhost:8000/graphql`
- Env: `X_CARGO_PROCESSOR_API_KEY` (defaults to `dev-key` via compose)

Environment

- Backend env template: `backend/.env.example`
- Important variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`
- Python env template: `python/.env.sample` (`X_CARGO_PROCESSOR_API_KEY`)

Developer checks (lint, build, format)

- Install workspace deps: `pnpm -w install`
- Lint all packages: `pnpm run lint:all`
- Build all packages: `pnpm run build:all`
- Format code: `pnpm run format`

Git hooks (optional)

- On first clone, run `pnpm install` at the repo root to install husky.
- Pre-commit: formats staged files with Prettier.
- Pre-push: runs backend/frontend lint and a dependency check.

Scripts

- `./scripts/seed.sh` — installs backend deps (if needed), runs migrations (if configured), and executes the seed script.
- `./scripts/seed.py` — seeds via Backend HTTP API (uses `BACKEND_URL`, `SEED_USERNAME`, `SEED_PASSWORD`).

ADRs

- Frameworks and choices are documented in the `ADR/` folder:
  - Backend: NestJS (`ADR/0001_backend_framework_nestjs.md`)
  - Frontend: React + Vite + Tailwind (`ADR/0002_frontend_framework_react_vite_tailwind.md`)
  - Python: FastAPI (`ADR/0003_python_framework_fastapi.md`)
  - Strawberry GraphQL choice (`ADR/0004_strawberry_graphql_choice.md`)
  - RBAC & Ownership (`ADR/0004_rbac_ownership.md`)
  - Calculator strategies (`ADR/0002_calculator_strategies.md`)
  - pnpm choice (`ADR/0007_pnpm_choice.md`)

License

MIT
