# Platform Evolution Roadmap

**Status:** Planning / Experimental  
**Last updated:** 2026-05-05  
**Author:** kamwro

> This document describes future directions for the storage-calculator project. It clearly separates what is **implemented today** from what is **planned or experimental**. Nothing in the "future" sections should be presented as shipped until the work is done and merged.

---

## Table of Contents

1. [Current State](#1-current-state)
2. [Target Architecture](#2-target-architecture)
3. [Proposed Monorepo Structure](#3-proposed-monorepo-structure)
4. [App Responsibilities](#4-app-responsibilities)
5. [Shared Packages](#5-shared-packages)
6. [Why Split calculator-ui from web](#6-why-split-calculator-ui-from-web)
7. [How web Demonstrates Real Next.js Knowledge](#7-how-web-demonstrates-real-nextjs-knowledge)
8. [How calculator-ui Remains a Client-Heavy App](#8-how-calculator-ui-remains-a-client-heavy-app)
9. [Backend Persistence Roadmap: TypeORM → Drizzle ORM](#9-backend-persistence-roadmap-typeorm--drizzle-orm)
10. [API Contract Roadmap](#10-api-contract-roadmap)
11. [cargo-processor as a Microservice](#11-cargo-processor-as-a-microservice)
12. [Terraform Mock Infrastructure](#12-terraform-mock-infrastructure)
13. [Next.js 15 → 16 Upgrade](#13-nextjs-15--16-upgrade)
14. [Implementation Phases](#14-implementation-phases)
15. [Risks](#15-risks)

---

## 1. Current State

### What is implemented today

| Area                          | Status        | Notes                                                                                                                  |
|-------------------------------|---------------|------------------------------------------------------------------------------------------------------------------------|
| NestJS REST API               | ✅ Implemented | Full CRUD for containers, items, item-types, users                                                                     |
| JWT authentication            | ✅ Implemented | Login, register, Bearer token                                                                                          |
| RBAC (admin/user roles)       | ✅ Implemented | `@Roles()` decorator + `RolesGuard`                                                                                    |
| Strategy Pattern calculator   | ✅ Implemented | `first_fit`, `best_fit` bin-packing strategies                                                                         |
| PostgreSQL + TypeORM          | ✅ Implemented | 4 entities, 1 migration, Docker Compose                                                                                |
| NestJS Swagger                | ✅ Implemented | Auto-generated API docs                                                                                                |
| Helmet + throttling           | ✅ Implemented | `helmet`, `@nestjs/throttler`                                                                                          |
| Next.js 15 dashboard UI       | ✅ Implemented | App Router, login page, dashboard page                                                                                 |
| TanStack Query v5             | ✅ Implemented | Server state management in frontend                                                                                    |
| react-hook-form               | ✅ Implemented | Form state and validation                                                                                              |
| TailwindCSS 4                 | ✅ Implemented | All styling utility-first                                                                                              |
| Security headers              | ✅ Implemented | `X-Frame-Options`, `X-Content-Type-Options`, etc.                                                                      |
| Playwright API E2E            | ✅ Implemented | 6 test suites covering full API surface                                                                                |
| Playwright UI E2E             | ✅ Implemented | Dashboard smoke test                                                                                                   |
| GitHub Actions CI             | ✅ Implemented | Lint → build → test per service                                                                                        |
| SBOM + vulnerability scanning | ✅ Implemented | Syft (SPDX) + Grype + SARIF upload                                                                                     |
| pnpm monorepo                 | ✅ Implemented | `backend` + `frontend` workspaces                                                                                      |
| cargo-processor integration   | ⚠️ Partial    | HTTP client exists in `backend/src/integrations/cargo/`; the actual `cargo-processor` service is a separate repository |
| SQLite in-memory for E2E      | ✅ Implemented | CI uses `DB_TYPE=sqlite` via TypeORM                                                                                   |

### What should be considered production-like

The following are solid and could stand up to code review scrutiny:

- Backend module structure, RBAC, JWT flow
- Strategy Pattern calculator with unit tests
- GitHub Actions CI with SBOM and Grype scanning
- TypeORM entities + migration + Docker Compose setup
- Playwright E2E covering auth, CRUD, calculator, RBAC

### What should be described as portfolio/playground only

- The frontend UI is functional but not polished — no loading skeletons, no empty states, minimal error UX
- `cargo-processor` integration is wired on the backend side but the external service is a separate, independent repo
- No deployment — the project runs locally and in CI; there is no staging or production environment
- No HTTPS, no real secrets management, no observability stack

---

## 2. Target Architecture

### High-level system overview

```
                        ┌─────────────────────┐
                        │      Internet        │
                        └────────┬────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
           ┌──────▼──────┐               ┌──────▼──────┐
           │     web      │               │calculator-ui │
           │ (marketing,  │               │(auth dashboard│
           │  content,    │               │ TanStack Q   │
           │  SSG/ISR)    │               │ client-heavy)│
           └──────┬──────┘               └──────┬──────┘
                  │ CMS/MDX content             │ REST API calls
                  │                             │
           ┌──────▼──────┐               ┌──────▼──────┐
           │  cms / MDX  │               │     api      │
           │ (Strapi or  │               │  (NestJS,    │
           │  MDX files) │               │  JWT, RBAC)  │
           └─────────────┘               └──────┬──────┘
                                                │
                             ┌──────────────────┼───────────────────┐
                             │                  │                   │
                      ┌──────▼──────┐    ┌──────▼──────┐   ┌───────▼──────┐
                      │ PostgreSQL  │    │cargo-processor│  │   (future    │
                      │ (TypeORM or │    │ (FastAPI +   │  │   services)  │
                      │  Drizzle)   │    │  GraphQL)    │  └──────────────┘
                      └─────────────┘   └─────────────┘
```

### Request flow

| Scenario                          | Flow                                                                                            |
|-----------------------------------|-------------------------------------------------------------------------------------------------|
| Public visitor reads landing page | Browser → `web` (SSG page served from CDN/Vercel) → MDX/CMS content                             |
| User logs in to dashboard         | Browser → `calculator-ui` → `api` `/auth/login` → JWT issued                                    |
| User runs calculator              | Browser → `calculator-ui` → `api` `/calculator/evaluate` → response                             |
| User uploads raw cargo data       | Browser → `calculator-ui` → `api` → `cargo-processor` (GraphQL) → normalised items → `api` → DB |
| CI build check                    | GitHub Actions → lint → build → test → SBOM → Grype scan                                        |

---

## 3. Proposed Monorepo Structure

> **Status: Planned.** Current structure has `backend/` and `frontend/` at root. The target renames and adds apps.

```
storage-calculator/
├── apps/
│   ├── api/                    # renamed from backend/
│   ├── calculator-ui/          # renamed from frontend/
│   ├── web/                    # NEW: public marketing/content site
│   ├── cms/                    # NEW: Strapi or MDX content folder
│   └── cargo-processor/        # NEW: moved from separate repo (Python/FastAPI)
├── packages/
│   ├── types/                  # shared TypeScript types or generated OpenAPI client
│   ├── schemas/                # shared Zod schemas (optional)
│   ├── ui/                     # shared React component library (optional)
│   └── config/                 # shared ESLint, TS, Tailwind config
├── infra/
│   └── terraform/              # mock infrastructure blueprint
├── e2e/                        # Playwright tests (api + ui)
├── scripts/                    # seed scripts, utilities
├── ADR/                        # Architecture Decision Records
├── docs/                       # planning documents (this file)
├── docker-compose.yml          # local full-stack dev
├── pnpm-workspace.yaml
└── CLAUDE.md
```

The `pnpm-workspace.yaml` would expand to:

```yaml
packages:
  - apps/*
  - packages/*
```

---

## 4. App Responsibilities

### api (NestJS)

- All business logic: containers, items, item-types, calculator, users
- JWT issuance and verification
- RBAC enforcement
- Swagger/OpenAPI spec generation
- Calls `cargo-processor` for raw data normalization
- Owns PostgreSQL schema via migrations

### calculator-ui (Next.js — authenticated dashboard)

- Login, register, dashboard views
- TanStack Query for all server states
- react-hook-form for all forms
- Client Components throughout (intentional — heavily interactive)
- Communicates only with `api` via `/api/*` rewrite proxy
- No public pages; all routes require authentication

### web (Next.js — public marketing site)

> **Status: Planned.**

- Public landing page, feature overview, pricing (mock), documentation
- Server Components by default; Client Components only for interactive islands
- SSG for static content, ISR for content that changes on a schedule
- CMS/MDX content fetching at build time or with ISR revalidation
- Full metadata, Open Graph, and structured data for SEO
- No authentication; no API calls at runtime (build-time data only or ISR)

### cms / content

> **Status: Planned.**

- **Phase 2a (MDX/mock):** Markdown/MDX files in `apps/cms/content/`; `web` imports them at build time. Zero runtime dependency.
- **Phase 2b (Strapi, optional later):** Replace MDX files with a Strapi CMS running locally or on a free tier. `web` fetches content via Strapi REST/GraphQL API.
- Owns all marketing copy, blog posts, feature descriptions

### cargo-processor (Python/FastAPI)

> **Status: Planned — currently lives in a separate repository.**

- Receives raw cargo data (CSV, JSON payloads) and normalizes it into the item/item-type schema expected by `api`
- Exposes a GraphQL mutation (`normalize`) backed by Strawberry GraphQL
- Exposes a REST health endpoint (`GET /health`)
- Stateless: no database, no auth of its own
- Called exclusively by `api`; never directly by frontend apps

---

## 5. Shared Packages

> **Status: Planned.** Currently, types are duplicated between `backend/` DTOs and `frontend/src/types.ts`.

### packages/types

Two realistic options:

**Option A — Generated OpenAPI client**

- `api` generates an OpenAPI spec via `@nestjs/swagger`
- A code-gen step (e.g. `openapi-typescript` or `orval`) produces a typed client in `packages/types`
- `calculator-ui` and `web` import the generated client directly
- Single source of truth for request/response shapes

**Option B — Shared Zod schemas**

- Define Zod schemas in `packages/schemas`
- `api` uses them to validate DTOs (via a custom NestJS pipe)
- Frontend uses them for form validation and response parsing
- Both ends share the same validation logic

See [Section 10](#10-api-contract-roadmap) for the full comparison and recommendation.

### packages/ui (optional)

- Shared Tailwind-styled React components (buttons, inputs, cards)
- Only worth creating if `web` and `calculator-ui` have genuinely shared UI patterns
- Avoid premature extraction; wait until duplication actually appears

### packages/config

- Shared `eslint.config.mjs` base
- Shared `tsconfig.base.json`
- Shared Tailwind/PostCSS config if both apps use identical setup
- Reduces config drift across workspaces

---

## 6. Why Split calculator-ui from web

| Concern       | calculator-ui                      | web                         |
|---------------|------------------------------------|-----------------------------|
| Audience      | Authenticated users                | General public              |
| Rendering     | Mostly CSR (Client Components)     | SSG/ISR + Server Components |
| Auth          | JWT required for all routes        | No auth                     |
| Data fetching | TanStack Query (runtime API calls) | Build-time CMS/MDX or ISR   |
| SEO           | Not needed (behind login)          | Critical                    |
| UX pattern    | Dashboard / data-heavy app         | Marketing / content site    |
| Deployment    | Could run on any Node host         | CDN-friendly static output  |

Keeping them as one app would force awkward compromises: either disable SSG for pages that don't need it or introduce complex auth-aware rendering logic into a site that should be purely static. Splitting them allows each app to use the rendering strategy that actually fits its purpose.

---

## 7. How web Demonstrates Real Next.js Knowledge

> **Status: Planned.** The `web` app does not exist yet.

The `web` app is specifically designed to showcase Next.js server-side capabilities that `calculator-ui` intentionally avoids:

- **Server Components by default** — no `"use client"` on pages that don't need interactivity
- **SSG** — `generateStaticParams` + `export const dynamic = 'force-static'` for landing pages
- **ISR** — `export const revalidate = 3600` for content that changes infrequently (blog, changelog)
- **Metadata API** — `export const metadata` in layouts and pages for title, description, Open Graph, Twitter cards
- **Structured data** — JSON-LD for search engines
- **CMS/content fetching** — reading MDX files at build time via `fs`/`gray-matter`, or Strapi API calls with `fetch` + Next.js caching options (`{ next: { revalidate: 3600 } }`)
- **Image optimization** — `next/image` for all images with proper `alt`, `width`, `height`
- **Public page structure:**
  - `/` — Hero, features overview, call to action
  - `/features` — Detailed feature descriptions (SSG from MDX)
  - `/docs` — Documentation pages (SSG from MDX)
  - `/blog` (optional) — ISR blog (from MDX or Strapi)
  - `/pricing` — Mock pricing page (static)

---

## 8. How calculator-ui Remains a Client-Heavy App

The current `frontend/` (future `calculator-ui`) is intentionally client-heavy. This is not a shortcut — it reflects the UX requirements of an interactive data dashboard.

**Why most components are `"use client"`:**

- The dashboard manages complex, interdependent local state (selected container, draft items, form state)
- TanStack Query polls or refetches in the background after mutations
- Forms are controlled; validation feedback must be synchronous
- Server Components cannot subscribe to browser events or call hooks

**Current auth flow:**

1. User submits credentials via `AuthForm`
2. `api` returns a JWT
3. JWT stored in `localStorage`
4. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
5. On 401, interceptor clears token and redirects to `/login`

**Known limitation of localStorage JWT:**

- Vulnerable to XSS if any third-party script is ever loaded
- Acceptable for a portfolio app; not acceptable for production

**Future migration path to httpOnly cookies:**

1. `api` sets JWT as `Set-Cookie: token=...; HttpOnly; SameSite=Strict; Secure`
2. Axios switches to `withCredentials: true`
3. Remove token from `localStorage`
4. CSRF protection is added if needed (double-submit cookie or custom header)
5. This migration does not require changing `"use client"` status of components — it only changes how the token travels

---

## 9. Backend Persistence Roadmap: TypeORM → Drizzle ORM

> **Status: Planned / Experimental.** TypeORM is the current implementation. This section assesses whether migrating to Drizzle ORM is worthwhile and proposes a safe migration strategy.

### What TypeORM currently provides

- **Entities:** Class-based with `@Entity()`, `@Column()`, `@ManyToOne()` decorators
- **Repositories:** `InjectRepository()` pattern; repositories injected into services
- **Migrations:** Auto-generated via `typeorm migration:generate`; one Init migration exists
- **Decorators:** Heavy use of `reflect-metadata` for schema inference at runtime
- **NestJS integration:** `@nestjs/typeorm` module; first-class support in the ecosystem
- **Dual-database support:** PostgreSQL in production, SQLite in-memory for E2E/CI (via `DB_TYPE` env var and `DataSourceOptions`)

### What Drizzle ORM would provide

- **Schema-first:** Schema defined in plain TypeScript with full type inference; no decorators
- **Typed SQL-like query builder:** `.select()`, `.where()`, `.insert()` — explicit, readable, close to SQL
- **Explicit migrations:** `drizzle-kit generate` produces SQL migration files; no hidden magic
- **Stronger type inference:** Column types infer directly from schema definitions; no runtime metadata
- **Less magic:** No `reflect-metadata`, no decorator transforms, no implicit lazy loading
- **Smaller runtime footprint:** Drizzle core is lightweight compared to TypeORM's full ORM
- **Drizzle Studio:** Optional visual schema browser

### Tradeoffs

| Concern            | TypeORM                                          | Drizzle ORM                                        |
|--------------------|--------------------------------------------------|----------------------------------------------------|
| NestJS idiom fit   | Native — `@nestjs/typeorm` module exists         | Manual setup — custom provider or `drizzle-nestjs` |
| Schema definition  | Decorator-based on entity classes                | Schema file(s) with typed builder functions        |
| Query style        | Repository methods + QueryBuilder                | SQL-like chainable API                             |
| Type safety        | Good; some gaps with relations                   | Excellent; full inference from schema              |
| Migration tooling  | `typeorm migration:generate` (sometimes fragile) | `drizzle-kit generate` (explicit SQL output)       |
| SQLite for E2E     | Supported via `DB_TYPE=sqlite` switch            | Supported via `better-sqlite3` driver              |
| Learning curve     | Familiar if you know JPA/Active Record patterns  | Steeper if unfamiliar with explicit query builders |
| Complexity         | Higher for simple projects                       | Lower once schema is defined                       |
| Ecosystem maturity | Mature; stable                                   | Maturing rapidly; v1 stable since 2024             |

### Safe migration strategy

The goal is to migrate without breaking the existing API or E2E tests at any step.

1. **Keep the current API behavior unchanged.** Do not change any controller, DTO, or service interface during the migration.
2. **Add Drizzle schema** in a new `backend/src/infra/drizzle/schema.ts` matching the existing PostgreSQL schema exactly. Run a diff against the TypeORM entities to confirm no column is missed.
3. **Introduce Drizzle behind repository/service boundaries.** Replace one repository's TypeORM calls with Drizzle queries, keeping the service interface identical. The service's callers (controllers) never change.
4. **Migrate one module first** — `item-types` is the best candidate: it has the simplest schema (one table, no relations to other entities beyond user ownership), a small service, and existing E2E coverage.
5. **Keep tests green after each module.** Run `npm run test` (Jest unit) and `pnpm e2e:api` (Playwright) after every module migration. Do not proceed to the next module until both pass.
6. **Remove TypeORM** only after all modules (`containers`, `items`, `item-types`, `users`, `auth`, `seed`) are migrated and all tests pass. Remove `@nestjs/typeorm`, `typeorm` packages and all entity decorators.

### Risks

| Risk                                                      | Likelihood       | Mitigation                                                                                                                                                                |
|-----------------------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Migration drift between TypeORM entity and Drizzle schema | Medium           | Diff column-by-column before writing Drizzle schema; add an automated check if possible                                                                                   |
| Duplicated schema definitions during transition           | High (by design) | Accept as temporary; keep transition short; delete TypeORM entities per-module as you go                                                                                  |
| Breaking E2E setup                                        | Medium           | The E2E setup creates the SQLite schema via `TYPEORM_SYNC=true`; Drizzle needs its own schema push or migration step in the E2E env script — update `e2e.yml` accordingly |
| SQLite vs PostgreSQL differences                          | Low–Medium       | Drizzle's SQLite and PostgreSQL drivers have slightly different type support (e.g. `timestamp` vs `integer` for dates); test on both                                      |
| Overengineering                                           | High             | Drizzle migration is a learning exercise, not a business requirement. It should not block feature work.                                                                   |

### Recommendation: before or after web/CMS work?

**After.** The `web` app and CMS phases (Phases 1–3) have more visible portfolio impact and lower risk. The TypeORM → Drizzle migration is valuable as a technical learning exercise and demonstrates understanding of ORMs, but it is invisible to end users. Complete the frontend polish and public web app first, then tackle the persistence migration as Phase 4.

---

## 10. API Contract Roadmap

### Current state

- Backend: NestJS controllers with DTOs validated by `class-validator`; Swagger docs auto-generated by `@nestjs/swagger`
- Frontend: Manually maintained `frontend/src/types.ts` with TypeScript interfaces
- Risk: Types can drift between backend DTOs and frontend interfaces; no compile-time guarantee they stay in sync

### Options

#### Option A — Generated OpenAPI client (recommended)

**How it works:**

1. `api` generates an OpenAPI spec at startup via `@nestjs/swagger` (already configured)
2. A `packages/types` package runs `openapi-typescript` (type stubs only) or `orval` (full client with TanStack Query hooks) against the spec
3. `calculator-ui` and `web` import the generated types/client; manual `types.ts` is deleted

**Pros:** Single source of truth; types are always in sync with the actual API; `orval` can generate TanStack Query hooks directly

**Cons:** Requires a code-gen step in the build pipeline; generated code can be verbose; spec must be exported/committed or fetched from a running server

#### Option B — Shared Zod schemas

**How it works:**

1. Define Zod schemas in `packages/schemas`
2. Backend uses a custom NestJS pipe (`ZodValidationPipe`) to validate incoming DTOs against the schemas
3. Frontend uses the same schemas for form validation (`react-hook-form` + `zodResolver`) and response parsing

**Pros:** Validation logic truly shared; Zod schemas are readable and composable; no code-gen step

**Cons:** Requires replacing `class-validator` decorators with a Zod pipe in NestJS; schemas must cover both request and response shapes; adds a shared package dependency

#### Option C — tRPC

**How it works:** Replace REST endpoints with tRPC; full end-to-end type safety with no schema duplication

**Pros:** Best possible type safety; no code-gen; no manual sync

**Cons:** Requires rewriting the entire API layer; incompatible with the existing NestJS REST architecture; Swagger docs lost; cargo-processor integration becomes more complex; not appropriate for this project

### Recommendation

**Option A (generated OpenAPI client via `orval`)** for Phase 3.

- The backend already has `@nestjs/swagger` configured; the spec is essentially free
- `orval` generates TanStack Query hooks that integrate directly with `calculator-ui`'s existing query setup
- The `web` app can import the type stubs without the full client
- This is a realistic pattern used in production and demonstrates understanding of API-first design

Consider Option B (Zod schemas) as a complement rather than a replacement: Zod can be used for form validation in the frontend regardless of whether the backend adopts it.

---

## 11. cargo-processor as a Microservice

> **Status: Planned.** Currently, a separate repository. The backend has an integration client (`backend/src/integrations/cargo/`) that is ready to call it.

### What problem it should solve

Raw cargo data arrives in formats that do not directly map to the `Item`/`ItemType` schema. `cargo-processor` normalises this data — extracting item types, dimensions, weights — before `api` stores it. This separation keeps `api` clean of data-cleaning logic and allows `cargo-processor` to evolve independently (e.g., adding new source formats).

### How api communicates with it

The existing client (`cargo.client.ts`) calls a GraphQL mutation:

```code
mutation Normalize($source: String!, $payload: String!) {
  normalize(source: $source, payload: $payload) {
    itemTypes {
      name
      weight
      volume
    }
    items {
      name
      itemTypeName
      quantity
    }
  }
}
```

Environment variables already defined: `CARGO_URL`, `CARGO_API_KEY`, `CARGO_API_TOKEN`.

When moved into the monorepo, `CARGO_URL` defaults to `http://cargo-processor:8000` inside Docker Compose.

### How to avoid making it an artificial microservice

- **Do not split unless the domain boundary is real.** The boundary here is real: data normalization is a distinct concern from storage calculation.
- **Keep the interface narrow.** One GraphQL mutation, one health endpoint. Do not add CRUD or state.
- **Make it optional.** The calculator works without `cargo-processor`. Only the "import raw data" flow requires it. `api` should handle a `cargo-processor` outage gracefully (return a 503 with a clear message).
- **Do not give it a database.** It is a pure function: input raw payload, output normalized items. No persistence.

### Local Docker Compose integration

Add to the root `docker-compose.yml`:

```yaml
cargo-processor:
  build:
    context: ./apps/cargo-processor
    dockerfile: Dockerfile
  ports:
    - '8000:8000'
  environment:
    - PYTHONUNBUFFERED=1
  networks:
    - storage-calculator
  healthcheck:
    test: ['CMD', 'curl', '-f', 'http://localhost:8000/health']
    interval: 5s
    timeout: 5s
    retries: 5
```

The `api` service gains `depends_on: cargo-processor: condition: service_healthy` only if the cargo flow is required for basic startup. Otherwise, keep it optional via env vars.

### Testing strategy

- **Unit tests (pytest):** Test the normalization logic in isolation with fixture payloads
- **Integration test:** A dedicated Playwright or `httpx` test that calls the GraphQL mutation end-to-end with a known payload and asserts the output
- **Contract test:** Assert that the GraphQL schema exposed by `cargo-processor` matches what `cargo.client.ts` expects (prevents silent drift)
- **Graceful degradation test:** Confirm `api` returns a proper error when `cargo-processor` is unreachable

---

## 12. Terraform Mock Infrastructure

> **Status: Planned / Playground only.** This is an infrastructure blueprint and learning exercise. It is NOT a live-deployed environment. Do not claim it as production infrastructure.

### What to model

The goal is to demonstrate familiarity with cloud infrastructure as code, not to deploy a real system.

```
infra/terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── modules/
│   ├── network/          # VPC, subnets, security groups
│   ├── compute/          # API service (ECS Fargate or EC2)
│   ├── frontend/         # web + calculator-ui (S3 + CloudFront or Vercel-like)
│   ├── database/         # RDS PostgreSQL instance
│   ├── secrets/          # AWS Secrets Manager entries (JWT_SECRET, DB creds)
│   └── observability/    # CloudWatch log group, basic alarms
└── environments/
    ├── local/            # tfvars for local/testing scenarios
    └── prod/             # tfvars placeholder (not actually applied)
```

**Scope per module:**

| Module        | What it models                                                                               |
|---------------|----------------------------------------------------------------------------------------------|
| network       | VPC with public/private subnets, NAT gateway, security groups (API, DB, frontend)            |
| compute       | ECS Fargate task definition for `api`; ECR repository for the Docker image                   |
| frontend      | CloudFront distribution + S3 bucket for static assets, or a Vercel deployment resource       |
| database      | RDS PostgreSQL (db.t3.micro), subnet group, parameter group                                  |
| secrets       | Secrets Manager entries for `JWT_SECRET`, `DB_PASSWORD`; IAM policy granting ECS task access |
| observability | CloudWatch log group for ECS task; basic CPU/memory alarms; SNS topic                        |

### What not to overclaim

- **Never describe this as "production infrastructure"** unless it has been actually applied, validated, and is running a real workload
- Label it in the README as: "Infrastructure blueprint — not deployed"
- `terraform apply` is not run in CI; this is documentation-quality HCL that demonstrates design thinking
- The free tier / cost estimates are included as comments, not as guarantees

---

## 13. Next.js 15 → 16 Upgrade

> **Status: Planned / Experimental.** Next.js 15 is the current version (`^15.5.15`). This section plans a migration to Next.js 16 when it is released and stable.

### 13.1 Current state inventory

**Apps using Next.js:**

| App                                  | Version  | Router     | Notes                      |
|--------------------------------------|----------|------------|----------------------------|
| `frontend/` (future `calculator-ui`) | ^15.5.15 | App Router | All pages under `src/app/` |

**Relevant configuration facts:**

- **App Router only** — no Pages Router files exist
- **Client Components throughout** — every component file that uses hooks or state has `"use client"` at the top; pages (`login/page.tsx`, `dashboard/page.tsx`) are effectively client-entry points
- **`Providers.tsx`** wraps the app in TanStack Query's `QueryClientProvider` — this component must remain a Client Component
- **`next.config.ts`** uses:
  - `rewrites()` — proxies `/api/*` to `http://localhost:3000` (or `$BACKEND_URL`)
  - `headers()` — security headers applied to all routes
  - `outputFileTracingRoot` — set to monorepo root for correct tracing
  - No custom `webpack`, no `experimental` flags, no `images` config
- **No middleware** (`middleware.ts` does not exist)
- **No route handlers** (`route.ts` files do not exist — all API traffic goes through the rewrite proxy)
- **Environment variables:** Only `BACKEND_URL` (consumed in `next.config.ts`)
- **Dependencies that must be compatible:** React 19, TanStack Query v5, react-hook-form v7, TailwindCSS 4, TypeScript 6, ESLint 10

### 13.2 Why upgrade

- **Stay current** — using a supported, up-to-date framework version matters for a portfolio project
- **Learning goal** — understand what changes between major Next.js versions and how to handle them
- **Playground purpose** — this repo is explicitly a frontend engineering learning environment
- **Foundation for `web` app** — the new `web` app should start on the latest stable version; keeping `calculator-ui` on the same major version reduces cognitive overhead

### 13.3 Official migration guide

> Before performing any upgrade, read the official Next.js upgrade guide at `nextjs.org/docs/app/building-your-application/upgrading`. This section records the analysis; the actual breaking changes must be verified against the Next.js 16 release notes when available.

**Expected categories of breaking changes to assess:**

- `next.config.ts` API changes (deprecated options, renamed keys)
- App Router caching model changes (Next.js 15 already reworked caching defaults significantly compared to 14; verify whether 16 changes them again)
- Middleware API changes if middleware is introduced before the upgrade
- React version requirement (Next.js 16 may require React 19+; currently already on React 19 — likely low risk)
- `outputFileTracingRoot` option validity
- `rewrites` and `headers` API stability
- Turbopack becoming the default dev bundler (opt-out available but test first)

**Relevant codemods to run:**

```bash
npx @next/codemod@latest upgrade
```

Run in `apps/calculator-ui/` (or current `frontend/`) and review the diff before committing.

### 13.4 Risk assessment

| Risk                            | Likelihood | Impact | Notes                                                                                                      |
|---------------------------------|------------|--------|------------------------------------------------------------------------------------------------------------|
| `rewrites()` API change         | Low        | High   | Core to dev setup; if this breaks, local dev breaks immediately                                            |
| `headers()` API change          | Low        | Medium | Security headers; easy to spot in build output                                                             |
| Caching behavior change         | Medium     | Medium | `calculator-ui` is mostly CSR; TanStack Query handles its own caching — less exposed than an SSR-heavy app |
| Turbopack becoming default      | Medium     | Low    | May expose build differences; can opt out with `--no-turbopack` during testing                             |
| TanStack Query v5 compatibility | Low        | High   | TanStack Query follows React; check release notes for Next.js 16                                           |
| TailwindCSS 4 compatibility     | Low        | Medium | Tailwind 4 is PostCSS-based; verify `postcss.config.cjs` works with the new bundler                        |
| TypeScript 6 compatibility      | Low        | Low    | TypeScript 6 is already ahead of most frameworks; likely fine                                              |
| E2E test failures               | Medium     | Medium | Rendering or navigation changes can break Playwright selectors — run full E2E suite after upgrade          |
| React 19 compatibility          | Very Low   | —      | Already on React 19; this is likely a non-issue                                                            |

**Low-risk because the app is mostly client-side:**

- SSR hydration mismatches are unlikely — there is almost no server-rendered content to mismatch
- ISR/SSG cache changes are irrelevant — no static generation is used
- Server Component behavior changes do not apply — there are effectively no Server Components

### 13.5 Migration strategy

> Perform this as a dedicated branch, separate from feature work.

1. **Baseline** — confirm all tests pass on current Next.js 15 before touching anything:

   ```bash
   pnpm lint && pnpm build:all && pnpm e2e:api && pnpm e2e:ui
   ```

2. **Create branch** — `git checkout -b chore/nextjs-16-upgrade`

3. **Read the Next.js 16 release notes** — note every breaking change; annotate which ones apply to this repo

4. **Run the official codemod:**

   ```bash
   cd apps/calculator-ui   # or frontend/
   npx @next/codemod@latest upgrade
   ```

5. **Upgrade dependencies in `frontend/package.json`:**

   ```bash
   pnpm --filter calculator-ui add next@^16 react@latest react-dom@latest
   ```

   Then check `@types/react`, `@types/react-dom`, `@types/node` for compatibility.

6. **Run quality gate:**

   ```bash
   pnpm lint && pnpm build:all
   ```

   Fix any build errors before proceeding.

7. **Start a dev server and smoke test manually:**

   ```bash
   pnpm dev:frontend
   ```

   - Login flow works
   - Dashboard loads and data displays
   - Calculator panel functions
   - No console errors

8. **Run full E2E suite:**

   ```bash
   pnpm e2e:all
   ```

   Fix any failures caused by rendering/navigation changes.

9. **Compare before/after** — use browser DevTools to confirm no regressions in network requests, hydration, or performance metrics.

10. **Update docs** — if `next.config.ts` required changes, add an ADR entry (`ADR/0009_nextjs_16_upgrade.md`).

11. **Keep this separate** from CMS, cargo-processor, and TypeORM → Drizzle work. One concerns per branch.

### 13.6 Learning goals

Use this migration to deepen understanding of:

| Concept                         | What to investigate                                                                                                           |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Server vs Client Components     | Why does every component in `calculator-ui` need `"use client"`? Could any be server-rendered without breaking interactivity? |
| When `"use client"` is required | Hooks, event handlers, browser APIs — trace the dependency graph from `Providers.tsx` downward                                |
| SSR vs SSG vs ISR vs CSR        | `calculator-ui` is pure CSR; plan how `web` will use SSG + ISR                                                                |
| Hydration                       | What would break if a component rendered differently on server and client?                                                    |
| Routing and navigation          | How does App Router handle `router.replace()` vs `Link` vs `redirect()`?                                                      |
| Caching                         | What does Next.js 16 cache by default? How does `fetch` caching interact with TanStack Query?                                 |
| Metadata and SEO                | Practice in `web` app; understand why it does not matter in `calculator-ui`                                                   |

### 13.7 Relationship to future web app

**Recommendation:** Start the new `web` app directly on Next.js 16 (or the latest stable version at the time).

- The `web` app has no existing code to migrate, so it avoids any upgrade risk entirely
- It can immediately use the most current App Router patterns, caching APIs, and metadata conventions
- This creates a useful contrast: `calculator-ui` goes through a migration path (learning experience), while `web` starts greenfield on the latest version (another learning experience)
- The `web` app is where Next.js server-side capabilities — Server Components, SSG, ISR, metadata, CMS fetching — should be demonstrated; start it on the version that has the most mature versions of these APIs

**Interview narrative for this section:**

> "I used the Next.js 16 upgrade as a deliberate learning moment rather than a blind version bump. I audited the breaking changes, ran the official codemod, and checked which risks actually applied — most were low because the dashboard is almost entirely client-side. The more interesting result was realizing that the new public web app should start on Next.js 16 directly, and that app is where I'll properly demonstrate Server Components, ISR, and the metadata API — things that are intentionally absent from the authenticated dashboard."

---

## 14. Implementation Phases

> Each phase is a unit of work that should be completed independently. Do not start a later phase to avoid finishing an earlier one.

| Phase | Focus                       | Key deliverables                                                                               | Status  |
|-------|-----------------------------|------------------------------------------------------------------------------------------------|---------|
| 1     | Frontend polish             | Zod + react-hook-form validation, loading states, empty states, error UX, improved screenshots | Planned |
| 2     | web marketing app           | Public Next.js app, MDX content, SSG/ISR, metadata/SEO, Open Graph                             | Planned |
| 3     | API contract                | Generated OpenAPI client via `orval` in `packages/types`; delete manual `types.ts`             | Planned |
| 4     | Persistence experiment      | TypeORM → Drizzle ORM migration, one module at a time                                          | Planned |
| 5     | cargo-processor in monorepo | Move from separate repo, add Docker Compose integration, contract tests                        | Planned |
| 6     | Terraform blueprint         | `infra/terraform/` modules for network, compute, database, secrets, observability              | Planned |
| —     | Next.js 15 → 16 upgrade     | Dedicated branch; run codemods; verify lint/build/E2E; update ADR                              | Planned |

The Next.js upgrade should happen either before Phase 1 (so all subsequent work is on the new version) or as a standalone task between phases. It should not be bundled with feature work.

---

## 15. Risks

| Risk                                                           | Severity | Mitigation                                                                                                                                                                                                |
|----------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Overengineering                                                | High     | Only move to the next phase after the current one is complete and working. Avoid building abstractions before duplication actually exists.                                                                |
| Hard local setup                                               | Medium   | Every new service must have a working `docker-compose.yml` entry. A new developer (or future you) should be able to run `docker compose up` and have the full stack.                                      |
| Unclear service boundaries                                     | Medium   | `cargo-processor` must remain stateless. `web` must have no runtime dependency on `api`. Boundaries are defined by data flow, not convenience.                                                            |
| Too many technologies                                          | High     | Each technology addition must teach something new or solve a real problem. Terraform, Drizzle, Strapi, FastAPI in the same repo is ambitious — do not claim all of them as "implemented" unless they are. |
| Unfinished features being mistaken for implemented features    | High     | This document exists to prevent that. The README must always clearly list what is implemented vs what is planned. Update it after each phase.                                                             |
| Spending too much time on architecture instead of fundamentals | High     | This roadmap is a planning tool, not a to-do list that must be completed before interviews. Phase 1 (frontend polish) has the most direct interview impact.                                               |

---