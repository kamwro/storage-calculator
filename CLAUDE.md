# CLAUDE.md - Storage Calculator Project Guide

## Project Overview

**Storage Calculator** is a full-stack application for optimizing item storage across multiple containers using bin-packing algorithms.

- **Backend**: NestJS + PostgreSQL + REST API
- **Frontend**: Next.js 15 (App Router) + React 19 + TailwindCSS 4
- **Auth**: JWT-based RBAC (admin/user roles)
- **Key feature**: Calculator service with multiple packing strategies

---

## Architecture & Conventions

### Frontend Architecture

**Framework**: Next.js 15 App Router

- All pages and components are Client Components (`'use client'`) — the app is interactive/stateful throughout
- File-based routing: `/` → redirect to `/dashboard`; `/login` → auth form; `/dashboard` → main app
- `next.config.ts` rewrites `/api/:path*` to the NestJS backend (replaces Vite proxy)
- Path alias `@/` maps to `src/` for clean imports

**State Management**: Centralized in `src/app/dashboard/page.tsx`

- No Redux/Zustand — app state is simple (user, containers, itemTypes, selectedContainerId)
- Dashboard page manages all remote state; child components use props + callbacks
- Auth state managed via `localStorage` JWT + `router.replace('/login')` on logout/401

**API Layer**:

- `src/lib/api.ts`: Axios instance with interceptors
- **Auth interceptor**: Adds Bearer token to all requests
- **Error interceptor**: Normalizes errors, clears token and redirects on 401
- No data caching (refetch after mutations)
- **Response pattern**: `res.data?.data ?? res.data` (backend returns `{ data: [...] }` or bare object)

**Type System**:

- TypeScript strict mode
- Shared types in `src/types.ts`
- No `any` types (except legacy `e: any` in catch blocks pending cleanup)
- Path alias `@/*` → `./src/*` (configured in `tsconfig.json` + `next.config.ts` is TS-native)

### Backend Architecture

**Framework**: NestJS with modular structure

- `auth/`: JWT + roles guards + decorators
- `calculator/`: Business logic for packing strategies
- `containers/`: Container CRUD
- `items/`: Item management
- `item-types/`: ItemType CRUD
- `users/`: User management
- `infra/`: Database + ORM setup
- `core/`: Tokens + use-case ports

**Key patterns**:

- RBAC: `@Roles('admin')` decorator + `RolesGuard`
- DTOs for request/response validation
- Services handle business logic; controllers handle HTTP

---

## Coding Standards

### TypeScript

- **No bare `any` types** – Use explicit types or generics
- **Strict mode enabled** – Null checks, unused variables, etc.
- **Response types** – Always define API response shapes
- **Props are typed** – Use `React.FC<Props>` pattern

### Component Naming & Structure

- **PascalCase** for component files and names
- **Descriptive names**: `ContainerForm` not `Form`, `ItemsTable` not `Table`
- **Custom hooks prefix**: `use*` (e.g., `useFetch`, `useContainerDetail`)
- **Folder structure**: Group related components in subdirectories as they grow

### Styling

- **TailwindCSS only** – No inline `style={{}}` props
- **Utility-first** – Use Tailwind classes for all styling
- **Responsive design** – Use `md:`, `lg:` breakpoints

### State Management

- **Local state**: `useState` for UI-only state (form inputs, modals)
- **Remote state**: Use TanStack Query (`useQuery`/`useMutation`) for server data
- **Shared state**: Pass via props or Context API (no Redux yet)

---

## Tools & Dependencies

### Current Frontend Stack

- **next** ^15.3.0 – App Router framework (SSR-capable, file-based routing)
- **react** ^19.2.5 – UI library
- **react-dom** ^19.2.5 – React rendering
- **axios** ^1.15.0 – HTTP client
- **react-hook-form** ^7.72.1 – Form state management & validation
- **tailwindcss** ^4.2.2 – Styling
- **typescript** ^6.0.3 – Type safety
- **eslint** – Linting

### Planned Additions (Phase 3+)

- **Optional future**: Zustand (complex state), Vitest (testing)
- **Next.js Server Components**: migrate data-fetching to RSC once auth moves to cookies/sessions

---

## Build & Development Commands

### Workspace Commands (Run from repo root)

```bash
# Development
pnpm --filter backend dev       # NestJS dev with hot-reload (http://localhost:3000)
pnpm --filter frontend dev      # Start Next.js dev server (http://localhost:5173)

# Testing & Building
pnpm run lint:all               # Run ESLint on all packages
pnpm run build:all              # Build backend and frontend
pnpm --filter backend test      # Run backend unit tests
pnpm run e2e:all                # Run E2E tests

# Verify locally before pushing
pnpm run lint:all && pnpm run build:all
```

---

## Decision Log

### Why centralized state in App.tsx (not Redux)?

- App is small (8 components)
- State is simple (containers, itemTypes, user, auth)
- Redux overhead not justified yet
- Will migrate to Zustand/Context if >5+ connected components emerges

### Why Axios vs. native fetch?

- Already integrated with auth & error interceptors
- Bearer token injection handled globally
- Error normalization in one place
- Could migrate to fetch + custom interceptor later if needed

### Why REST API instead of GraphQL?

- GraphQL explored in ADR 0003 (strawberry-graphql for Python)
- REST is simpler for this project scope
- GraphQL can be added later as a parallel service
- No N+1 query problems at current data volume

### Form Library

- We use `react-hook-form` to reduce form boilerplate and manage validations, particularly in `AuthForm`, `ContainersList`, and `ItemTypesManager`.

### Why TailwindCSS (not CSS-in-JS)?

- ADR 0006: Early decision for Tailwind + Vite
- Fast build times, zero runtime overhead
- Utility-first matches component-driven development
- Tailwind 4.2 has good TypeScript support

---

## Frontend Project Structure (Current)

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (imports globals.css, metadata)
│   │   ├── page.tsx            # / → redirect to /dashboard
│   │   ├── globals.css         # Tailwind imports + custom utilities
│   │   ├── login/
│   │   │   └── page.tsx        # Login/register page
│   │   └── dashboard/
│   │       └── page.tsx        # Main dashboard (state management)
│   ├── lib/
│   │   └── api.ts              # Axios + interceptors
│   ├── types.ts                # Shared type definitions
│   ├── css.d.ts                # CSS side-effect import declaration
│   ├── components/
│   │   ├── AuthForm.tsx        # Login/register form
│   │   ├── CalculatorPanel.tsx # Packing calculator UI
│   │   ├── ContainerDetail.tsx # Container items + summary
│   │   ├── ContainersList.tsx  # Container list + creation form
│   │   ├── ErrorBanner.tsx     # Error display
│   │   ├── FormField.tsx       # Form input wrapper
│   │   ├── Header.tsx          # User + logout button
│   │   └── ItemTypesManager.tsx# ItemType list + creation form
├── next.config.ts              # Next.js config (API rewrites)
├── postcss.config.cjs          # Tailwind v4 PostCSS plugin
├── package.json
└── tsconfig.json
```

---

## Contact & Questions

- For ADR context: See `/ADR` folder
- For backend API docs: See `backend/README.md` (if exists) or NestJS Swagger endpoint
- For issues: Check browser console + network tab in DevTools
