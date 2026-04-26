Run the full quality gate for the storage-calculator monorepo. Execute these steps in order from the repo root, stopping on first failure:

1. `pnpm run format` — format all files
2. `pnpm run lint:all` — lint backend + frontend
3. `pnpm run build:all` — TypeScript compile backend + Next.js build frontend

Report which step passed or failed. If all pass, confirm the code is ready to commit.
