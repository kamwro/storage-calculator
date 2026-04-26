Run the Playwright API E2E test suite using an isolated SQLite in-memory backend.

Steps:

1. Start the backend in the background with isolation env vars:
   `DB_TYPE=sqlite DB_FILE=:memory: TYPEORM_SYNC=true TYPEORM_DROP_SCHEMA=true JWT_SECRET=dev-secret pnpm --filter backend dev`
2. Wait ~10 seconds for the backend to be ready, then poll `http://localhost:3000/api/item-types` until it responds (up to 30s).
3. Run `pnpm run e2e:api` from the repo root.
4. Report pass/fail counts from the Playwright output.
5. After tests complete, stop the background backend process.

Note: This uses SQLite in-memory — no real database is touched. Each run starts with a clean schema.
