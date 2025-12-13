#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Installing deps (if needed)"
cd "$ROOT_DIR/backend"
pnpm install --silent || true

echo "==> Running database migrations (if configured)"
pnpm run migration:run || echo "(skip) migration:run failed or no migrations present"

echo "==> Seeding database"
pnpm run seed

echo "==> Done. Demo users: admin@example.com / admin1234; demo@example.com / demo1234"
