# 0005_backend_framework_nestjs — Why I chose NestJS

Date: 2025-12-13
Status: Accepted

Context
I need a backend that feels familiar to TypeScript developers, supports clean modular architecture, and makes auth/validation/testing straightforward. I also want something reviewers recognize.

Decision
I use NestJS for the backend.

Why

- Opinionated architecture that scales: modules, providers, DI, guards, interceptors, and pipes give me consistent structure from day one.
- First‑class TypeScript: great DX and types across controllers/DTOs/services.
- Batteries for APIs: routing, validation via `class-validator`, Swagger generation, and guards for auth are built in or well‑documented.
- Ecosystem: `@nestjs/typeorm` integrates cleanly with Postgres; plenty of examples and community answers.
- Testing story: `@nestjs/testing` makes unit/e2e testing ergonomic.

Alternatives I considered

- Express (manual wiring, faster to start, but I’d rebuild patterns Nest gives me for free).
- Fastify (via Nest adapter or standalone) — good performance, but Nest on Express is enough for this demo.
- AdonisJS/TS.ED — solid, but smaller ecosystem for the exact patterns I want to showcase.

Trade‑offs

- More boilerplate than micro frameworks.
- Learning curve if someone is new to Angular‑style decorators and DI.

Consequences

- Clear module boundaries (auth, users, item types, containers, items, calculator).
- Guards/pipes/DTOs keep validation and auth consistent.
