# AGENTS.md

> Quick-start guide for AI coding agents (Claude Code, Codex, Junie, GitHub Copilot Workspace).
> Read this before making changes. It covers architecture, commands, patterns, and safe-modification rules.

## What This Project Is

**Storage Calculator** — a TypeScript full-stack monorepo for planning how item types fit into storage
containers under weight and volume constraints.

Key features: bin-packing heuristics (Strategy Pattern), JWT/RBAC authentication, ownership-scoped
CRUD APIs, Playwright E2E tests, and per-service SBOM + vulnerability scanning in GitHub Actions CI.

**Stack**: pnpm workspaces · NestJS 11 · TypeORM + PostgreSQL · Next.js 15 (App Router) + React 19 · TailwindCSS 4 · Playwright

---

## Repository Layout

```
storage-calculator/
├── backend/                  # NestJS REST API (port 3000)
├── frontend/                 # React 19 + Vite (port 5173)
├── e2e/
│   ├── api/                  # Playwright API specs (auth, CRUD, RBAC, calculator)
│   └── ui/                   # UI spec scaffold (no tests yet)
├── scripts/                  # Seed helpers (seed.sh, seed.py)
├── ADR/                      # Architecture Decision Records
├── .github/workflows/        # CI: backend.yml, frontend.yml, e2e.yml
├── package.json              # Root monorepo scripts
├── pnpm-workspace.yaml       # pnpm workspaces definition
└── playwright.config.ts      # E2E runner configuration
```

---

## Backend Module Map

```
backend/src/
├── main.ts                         # Bootstrap: Swagger, CORS, global ValidationPipe
├── app.module.ts                   # Root module
├── auth/                           # JWT + Passport + RBAC
│   ├── jwt.strategy.ts             # Validates Bearer token, extracts { id, username, role }
│   ├── jwt.guard.ts                # Extends AuthGuard('jwt')
│   ├── roles.guard.ts              # Checks @Roles() metadata against user.role
│   ├── roles.decorator.ts          # @Roles('admin') | @Roles('user')
│   └── dto/                        # RegisterDto, LoginDto
├── calculator/                     # Bin-packing evaluation
│   ├── strategies.ts               # firstFit, bestFit, bestFitDecreasing + strategyMap
│   ├── strategy.types.ts           # StrategyFn<C> type, ContainerState<C> type
│   ├── calculator.service.ts       # Dispatches to strategyMap; enforces ownership
│   ├── calculator.controller.ts    # POST /calculator/evaluate
│   └── dto/evaluate.dto.ts         # EvaluateRequestDto (items[], containers[], strategy)
├── containers/                     # Container CRUD (ownership-scoped for non-admin)
├── items/                          # Item management within containers
├── item-types/                     # ItemType catalog (public read, admin write)
├── users/                          # User creation, lookup, bcrypt hashing
├── integrations/cargo/             # Optional external normalization service client
├── infra/postgres/
│   ├── data-source.ts              # TypeORM DataSource (Postgres or SQLite via env)
│   ├── entities/                   # User, Container, Item, ItemType
│   └── migrations/                 # TypeORM migrations
├── core/
│   ├── tokens.ts                   # DI injection symbols (AUTH_SERVICE, etc.)
│   ├── ports/                      # Service interfaces (IAuthService, ICalculatorService, …)
│   └── use-cases/                  # Business logic: CreateUser, AddItemToContainer, etc.
├── shared/
│   └── http/error.filter.ts        # Global HttpErrorFilter → { message, code }
└── seed/seed.ts                    # Demo data seeding script
```

---

## Frontend Map

**Framework**: Next.js 15 App Router. All pages and components are Client Components (`'use client'`).
Path alias `@/` resolves to `src/`.

```
frontend/
├── next.config.ts                  # API rewrites (/api/* → NestJS backend)
├── postcss.config.cjs              # Tailwind v4 PostCSS plugin (CJS format required)
└── src/
    ├── app/
    │   ├── layout.tsx              # Root layout (imports globals.css, sets metadata)
    │   ├── page.tsx                # / → redirect('/dashboard')
    │   ├── globals.css             # Tailwind @import + utility classes
    │   ├── login/page.tsx          # Login/register page; redirects to /dashboard on success
    │   └── dashboard/page.tsx      # Main app page; checks localStorage token on mount
    ├── lib/
    │   └── api.ts                  # Axios instance; Bearer interceptor; error normalization
    ├── types.ts                    # Shared domain types (ItemType, Container, Item, User, …)
    ├── css.d.ts                    # declare module '*.css' shim for TypeScript
    ├── hooks/useFetch.ts           # Generic data-fetching hook: { data, loading, error, refetch }
    └── components/
        ├── AuthForm.tsx            # Login/register with react-hook-form
        ├── ContainersList.tsx      # List + create container
        ├── ContainerDetail.tsx     # Container items + summary panel
        ├── ItemTypesManager.tsx    # ItemType catalog (admin-only create)
        ├── CalculatorPanel.tsx     # Strategy selector + evaluation results
        ├── Header.tsx              # User info + logout (calls onLogout prop)
        ├── ErrorBanner.tsx         # Error display
        └── FormField.tsx           # Input wrapper with inline error
```

---

## Key Design Patterns

### Strategy Pattern — Calculator

`backend/src/calculator/strategies.ts` exports three functions (`firstFit`, `bestFit`,
`bestFitDecreasing`) and a `strategyMap` that maps string keys to those functions.

`CalculatorService.evaluate()` resolves the strategy at runtime:

```ts
const pickFn = strategyMap[input.strategy]; // no switch/if chain
const pick = pickFn({ state, typeMap, typeId });
```

**To add a new strategy**: implement a `StrategyFn<ContainerEntity>`, add it to `strategyMap`,
and add the key to the `strategy` union in `EvaluateRequestDto`.

### Ports & Use Cases — Clean Architecture Lite

`backend/src/core/ports/` defines service interfaces (`ICalculatorService`, `IContainersService`, …).
`backend/src/core/use-cases/` contains business logic that depends on ports, not concretions.
DI symbols live in `backend/src/core/tokens.ts`.

### RBAC — Role-Based Access Control

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
create(@Body() dto: CreateItemTypeDto) { … }
```

Ownership enforcement is at the service layer: queries filter `{ where: { ownerId: user.id } }`.
Admins bypass ownership checks and can access all containers.

---

## Commands

### Monorepo root

```bash
pnpm -w install                         # Install all workspace dependencies
pnpm run lint:all                        # Lint backend + frontend
pnpm run build:all                       # Build backend + frontend
pnpm run format                          # Prettier over all TS/TSX/JSON/MD/CSS
pnpm run e2e:api                         # Run Playwright API specs (requires running backend)
pnpm run e2e:all                         # Run all Playwright projects
```

### Backend

```bash
pnpm --filter backend dev               # Hot-reload dev server (port 3000)
pnpm --filter backend build             # Compile TypeScript
pnpm --filter backend lint              # ESLint
pnpm --filter backend test              # Jest unit tests
pnpm --filter backend run test:ci       # Jest with --ci --passWithNoTests
pnpm --filter backend run seed          # Seed demo data (admin/demo users + sample items)
pnpm --filter backend run migration:run # Apply pending TypeORM migrations
pnpm --filter backend run migration:generate -- src/infra/postgres/migrations/MigrationName
```

### Frontend

```bash
pnpm --filter frontend dev              # Next.js dev server (port 5173)
pnpm --filter frontend build            # Next.js production build (TypeScript + webpack)
pnpm --filter frontend lint             # ESLint
```

### Full-stack dev (two terminals)

```bash
# Terminal 1
pnpm --filter backend dev

# Terminal 2
pnpm --filter frontend dev
```

Swagger UI: `http://localhost:3000/api/docs`

---

## Testing

### Unit tests

```bash
pnpm --filter backend test
```

Files: `backend/src/**/*.spec.ts`
DB: mocked repositories (Jest mocks or in-memory SQLite for integration-style tests).

### Playwright E2E (API layer)

Files: `e2e/api/*.spec.ts`
Each spec creates its own users via `/auth/register` — specs are fully isolated.
**Requires a running backend** on port 3000.

**Recommended E2E setup (SQLite in-memory, clean state on each start)**:

```bash
# Terminal 1 — backend with isolated DB
DB_TYPE=sqlite DB_FILE=:memory: TYPEORM_SYNC=true TYPEORM_DROP_SCHEMA=true \
  JWT_SECRET=dev-secret pnpm --filter backend dev

# Terminal 2 — run specs
pnpm run e2e:api
```

The GitHub Actions `e2e.yml` workflow uses this exact approach and is triggered manually
(`workflow_dispatch`) so it does not run on every push.

---

## Database

| Mode             | When used        | How to configure                                                             |
| ---------------- | ---------------- | ---------------------------------------------------------------------------- |
| PostgreSQL       | Dev / production | `backend/.env` (see `backend/.env.example`)                                  |
| SQLite in-memory | E2E tests, CI    | `DB_TYPE=sqlite DB_FILE=:memory: TYPEORM_SYNC=true TYPEORM_DROP_SCHEMA=true` |

**Entities**: `User`, `Container`, `Item`, `ItemType` — `backend/src/infra/postgres/entities/`
**Migrations**: `backend/src/infra/postgres/migrations/` — run via `migration:run`

**Seeded demo users** (after `pnpm --filter backend run seed`):

- Admin: `admin` / `admin1234`
- Demo: `demo` / `demo1234`

---

## API Surface (base path `/api`)

| Resource   | Method           | Path                      | Auth        |
| ---------- | ---------------- | ------------------------- | ----------- |
| Auth       | POST             | `/auth/register`          | Public      |
| Auth       | POST             | `/auth/login`             | Public      |
| Auth       | GET              | `/auth/me`                | JWT         |
| Item types | GET              | `/item-types`             | Public      |
| Item types | POST             | `/item-types`             | Admin       |
| Containers | GET/POST         | `/containers`             | JWT         |
| Containers | GET/PATCH/DELETE | `/containers/:id`         | JWT + owner |
| Containers | GET              | `/containers/:id/summary` | JWT + owner |
| Items      | GET/POST         | `/containers/:id/items`   | JWT + owner |
| Items      | PATCH/DELETE     | `/items/:id`              | JWT + owner |
| Calculator | POST             | `/calculator/evaluate`    | JWT         |

Paginated list responses: `{ data: T[], total, offset, limit }`
Error responses: `{ message: string, code: string }`

---

## CI Overview

| Workflow       | Trigger                         | Jobs                                                                |
| -------------- | ------------------------------- | ------------------------------------------------------------------- |
| `backend.yml`  | Push/PR to main (backend path)  | lint → build → unit tests → SBOM (Syft) → Grype scan → upload SARIF |
| `frontend.yml` | Push/PR to main (frontend path) | lint → build → SBOM (Syft) → Grype scan → upload SARIF              |
| `e2e.yml`      | Manual (`workflow_dispatch`)    | build → start services → Playwright API + UI specs                  |

SBOM artifacts: `backend-sbom` / `frontend-sbom` (SPDX JSON).
Grype results: uploaded to GitHub Code Scanning as SARIF.

---

## Code Style

- **TypeScript strict mode** — no `any`, no untyped params
- **No inline `style={{}}` in React** — Tailwind utility classes only (exception: dynamic numeric values like progress bar widths)
- **No direct `new` for NestJS services** — always use DI
- **Remote state in frontend** — use `useFetch` hook, not ad-hoc `useEffect` fetches
- **Errors in backend** — throw `HttpException` subclasses (`BadRequestException`, `ForbiddenException`, etc.)

---

## Safe Modification Rules

**Safe — additive, low blast radius:**

- Add a new strategy to `strategyMap` in `strategies.ts` (extend without touching existing)
- Add new DTO fields (non-breaking if optional)
- Add new API endpoints
- Add Playwright specs in `e2e/api/`
- Update Tailwind classes in frontend components
- Edit `README.md`, `AGENTS.md`, `CLAUDE.md`, or `ADR/` files

**Check first — downstream dependencies:**

- Entity fields → requires a new TypeORM migration
- Auth guard wiring → can silently break all endpoints
- `EvaluateRequestDto.strategy` union → frontend + E2E specs depend on exact string values
- `error.filter.ts` response shape → E2E specs assert `{ message, code }`
- `src/lib/api.ts` interceptors → affects every frontend request
- `next.config.ts` rewrites → changes how the frontend finds the backend

**Avoid without explicit agreement:**

- Changing the JWT payload shape (`id`, `username`, `role`)
- Modifying existing migration files (create a new migration instead)
- Replacing TypeORM with another ORM
- Adding `'use server'` directives or Server Components without first migrating auth from localStorage to cookies/sessions
- Adding a global state library to the frontend (discuss with owner first)

---

## Workflow Recipes

Step-by-step guides for common tasks live in `.claude/commands/`. They are plain markdown — any agent can read and follow them. Claude Code users can also invoke them as slash commands.

| File                               | Slash command         | What it does                                            |
| ---------------------------------- | --------------------- | ------------------------------------------------------- |
| `.claude/commands/check.md`        | `/check`              | format → lint → build (full quality gate)               |
| `.claude/commands/seed.md`         | `/seed`               | reseed the dev database with demo data                  |
| `.claude/commands/db-init.md`      | `/db-init`            | run migrations then seed (correct order enforced)       |
| `.claude/commands/e2e.md`          | `/e2e`                | start isolated SQLite backend, run Playwright API specs |
| `.claude/commands/add-strategy.md` | `/add-strategy <key>` | add a new bin-packing strategy end-to-end (5 files)     |
