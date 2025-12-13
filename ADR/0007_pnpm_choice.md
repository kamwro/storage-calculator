# 0007_pnpm_choice — Why I chose pnpm for the monorepo

Date: 2025-12-13
Status: Accepted

Context
This project is a small monorepo (backend + frontend + future python). I want fast, space‑efficient installs, deterministic lockfiles, and simple workspace tooling.

Decision
I use pnpm as the package manager and workspaces tool.

Why
- Disk efficiency: content‑addressable store and symlinks drastically reduce node_modules size across packages.
- Speed: installs and updates are consistently faster on my machine than npm/yarn for multi‑package repos.
- Workspaces: first‑class support; filtering (`pnpm --filter`) is great for running scripts in targeted packages.
- Determinism: reliable lockfile behavior and reproducible installs.

Alternatives I considered
- npm workspaces: solid baseline, but slower installs and less ergonomic filtering for scripts.
- yarn (berry): powerful, but PnP and config complexity aren’t necessary for this demo.

Consequences
- CI must use `pnpm install` with a matching pnpm version (documented in repo).
- Contributors should have pnpm installed; this is called out in the README requirements.
