Storage Calculator

WIP

A simple monorepo project built with pnpm, containing:

-   Backend: NestJS
-   Frontend: React + Vite
-   Global formatting: Prettier
-   Local linting: ESLint (separate configs for backend & frontend)
-   Dependency checks: npm‑check‑updates
-   Git hooks: Husky (pre-commit formatting, pre-push checks)

Project Structure

    storage-calculator/
    │
    ├─ backend/        # NestJS API
    │  ├─ src/
    │  ├─ tsconfig.json
    │  ├─ eslint.config.mjs
    │  └─ package.json
    │
    ├─ frontend/       # React + Vite app
    │  ├─ src/
    │  ├─ tsconfig.json
    │  ├─ eslint.config.mjs
    │  └─ package.json
    │
    ├─ pnpm-workspace.yaml
    ├─ package.json     # root scripts (dev, format, deps)
    ├─ .prettierrc
    └─ .husky/

Development

Start backend (NestJS)

    pnpm dev:backend

Start frontend (Vite)

    pnpm dev:frontend

Formatting

Prettier is global and runs on every commit:

    pnpm format

Linting

Linting is local to each package:

    pnpm --filter backend lint
    pnpm --filter frontend lint

Dependency Management

Check for major updates:

    pnpm deps:check:major

Update minor dependencies:

    pnpm deps:update:minor

Git Hooks (Husky)

-   pre-commit → format with Prettier
-   pre-push → lint backend, lint frontend, check dependencies

Requirements

-   Node: 24.11.1+
-   pnpm: 10.24.0

License

MIT
