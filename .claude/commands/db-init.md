Initialize the database for local development. Run from the repo root:

1. `pnpm --filter backend run migration:run` — apply pending TypeORM migrations
2. `pnpm --filter backend run seed` — load demo data (admin@example.com / admin1234, demo@example.com / demo1234)

If migration:run fails, do not proceed to seed — report the error and suggest checking DB_HOST/DB_USERNAME/DB_PASSWORD in backend/.env.
If seed fails, report the error and suggest running migration:run first if the schema looks wrong.
On success, confirm: "DB ready — admin@example.com / admin1234, demo@example.com / demo1234".
