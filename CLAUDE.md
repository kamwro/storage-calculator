# CLAUDE.md - Storage Calculator Project Guide

## Project Overview

**Storage Calculator** is a full-stack application for optimizing item storage across multiple containers using bin-packing algorithms.

- **Backend**: NestJS + PostgreSQL + REST API
- **Frontend**: React 19 + Vite + TailwindCSS 4
- **Auth**: JWT-based RBAC (admin/user roles)
- **Key feature**: Calculator service with multiple packing strategies

---

## Architecture & Conventions

### Frontend Architecture

**State Management**: Centralized in `App.tsx`
- No Redux/Zustand currently (app is simple enough)
- Root component manages: `auth`, `user`, `containers`, `itemTypes`, `selectedContainerId`
- Child components use props + callbacks (`onCreated`, `onChanged`)
- This will evolve with custom hooks and Context API as features grow

**API Layer**:
- Centralized `api.ts`: Axios instance with interceptors
- **Auth interceptor**: Adds Bearer token to all requests
- **Error interceptor**: Normalizes errors, clears token on 401
- No data caching (currently refetch after mutations)
- **Response pattern**: `res.data?.data ?? res.data` (backend returns `{ data: [...] }` or bare array)

**Type System**:
- TypeScript strict mode
- Types defined per-component inline (being consolidated in Phase 1)
- No `any` types allowed (goal: eliminate over time)
- Goal: Infer types from backend API documentation or generate via OpenAPI

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
- **react** ^19.2.4 – UI library
- **react-dom** ^19.2.4 – React rendering
- **axios** ^1.13.5 – HTTP client
- **vite** ^7.3.1 – Build tool
- **tailwindcss** ^4.2.1 – Styling
- **typescript** ^5.9.3 – Type safety
- **eslint** – Linting

### Planned Additions (Phase 2+)
- **react-hook-form** – Form state management & validation
- **Optional future**: React Query (data caching), Zustand (complex state), Vitest (testing)

---

## Build & Development Commands

### Frontend
```bash
cd frontend

# Development
npm run dev              # Start Vite dev server (http://localhost:5173)

# Testing
npm run lint            # Run ESLint
npm run build           # Build for production (checks TypeScript)

# Verify all three work after changes
npm run lint && npm run build && npm run dev
```

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
│   ├── api.ts                  # Axios + interceptors
│   ├── App.tsx                 # Root component, state management
│   ├── main.tsx                # React DOM render entry
│   ├── index.css               # Tailwind imports + custom utilities
│   ├── components/
│   │   ├── AuthForm.tsx        # Login/register form
│   │   ├── CalculatorPanel.tsx # Packing calculator UI
│   │   ├── ContainerDetail.tsx # Container items + summary
│   │   ├── ContainersList.tsx  # Container list + creation form
│   │   ├── ErrorBanner.tsx     # Error display
│   │   ├── Header.tsx          # User + logout button
│   │   ├── ItemTypesManager.tsx# ItemType list + creation form
│   │   └── ProjectsManager.tsx # (Unused – to be deleted in Phase 3)
│   └── hooks/                  # (New, Phase 1+)
│       └── useFetch.ts         # Generic data-fetching hook
├── types.ts                    # (New, Phase 1) Shared type definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.cjs
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
