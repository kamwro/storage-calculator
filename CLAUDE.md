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

## Frontend Refactoring Roadmap

### Phase 1: Foundation (Type Safety + Fetch Layer)

**Goal**: Eliminate type duplication, consolidate fetch patterns  
**Duration**: ~2 hours  
**Risk**: Low – purely organizational, no behavioral changes

**Deliverables**:

1. `frontend/src/types.ts` – Shared type definitions
2. `frontend/src/hooks/useFetch.ts` – Generic data-fetching hook
3. Refactored `App.tsx` – Use `useFetch` for data loads
4. Updated components – Import from shared types

**Files affected**: 9 files modified/created

### Phase 2: Form Management + UX (Future – not yet implemented)

**Goal**: Reduce form boilerplate, add loading/error feedback  
**Tools**: react-hook-form, custom form components  
**Deliverables**: Form components, loading spinners, enhanced error handling

### Phase 3: Code Cleanup (Future – not yet implemented)

**Goal**: Remove dead code, extract large components  
**Deliverables**: Delete ProjectsManager, extract ItemsTable, DraftItemsList

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
- **Remote state**: Use `useFetch` hook for server data
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

- **Optional future**: React Query (data caching), Zustand (complex state), Vitest (testing)
- **Next.js Server Components**: migrate data-fetching to RSC once auth moves to cookies/sessions

---

## Build & Development Commands

### Frontend

```bash
cd frontend

# Development
pnpm dev               # Start Next.js dev server (http://localhost:5173)

# Testing
pnpm lint              # Run ESLint
pnpm build             # Build for production (TypeScript check + Next.js build)

# Verify all three work after changes
pnpm lint && pnpm build && pnpm dev
```

# From repo root (preferred)

pnpm --filter frontend dev
pnpm --filter frontend build
pnpm --filter frontend lint

### Backend

```bash
cd backend

# Development
npm run start:dev       # NestJS dev with hot-reload (http://localhost:3000)

# Testing
npm run lint            # Run ESLint
npm run build           # Compile TypeScript

# Verify all three work after changes
npm run lint && npm run build && npm run start:dev
```

### Full Stack

```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Access frontend at http://localhost:5173
# Backend API at http://localhost:3000
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

### Why no form library initially?

- App has only 3 simple forms (login, create container, create item-type)
- Would add bundle overhead for minimal benefit
- Phase 2 introduces react-hook-form when form complexity grows

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
│   └── hooks/
│       └── useFetch.ts         # Generic data-fetching hook
├── next.config.ts              # Next.js config (API rewrites)
├── postcss.config.cjs          # Tailwind v4 PostCSS plugin
├── package.json
└── tsconfig.json
```

---

## Verification Checklist

### Phase 1 Verification

After implementing Phase 1:

**Backend** (should be unchanged):

- ✓ `cd backend && npm run lint`
- ✓ `cd backend && npm run build`
- ✓ `cd backend && npm run start:dev` starts without errors

**Frontend** (after changes):

- ✓ `cd frontend && npm run lint` – No ESLint errors
- ✓ `cd frontend && npm run build` – Vite builds successfully, no TS errors
- ✓ `cd frontend && npm run dev` – Dev server starts
- ✓ Browser: Page loads, login works, data displays identically to before
- ✓ Browser DevTools: No console errors, API calls work
- ✓ Spot-check: Open any component, verify it imports from `src/types.ts`

---

## Current Implementation Status

- [x] Phase 1: Foundation
  - [x] Create `types.ts`
  - [x] Create `hooks/useFetch.ts`
  - [x] Refactor `App.tsx`
  - [x] Update components to use shared types
  - [x] Verify build + lint + dev
- [x] Phase 2: Form Management + UX
- [ ] Phase 3: Code Cleanup

---

## Contact & Questions

- For ADR context: See `/ADR` folder
- For backend API docs: See `backend/README.md` (if exists) or NestJS Swagger endpoint
- For issues: Check browser console + network tab in DevTools
