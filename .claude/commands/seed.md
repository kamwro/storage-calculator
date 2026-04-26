Reseed the development database with demo data. This CLEARS all existing data and recreates it.

Run from the repo root:
`pnpm --filter backend run seed`

Seeded accounts:

- admin@example.com / admin1234 (role: admin)
- demo@example.com / demo1234 (role: user)

Plus 3 item types (Small/Medium/Large Box) and 2 demo containers with sample items.

If this fails with a connection error, check that PostgreSQL is running and backend/.env has correct DB\_\* credentials.
