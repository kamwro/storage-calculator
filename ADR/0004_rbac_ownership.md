# 0004_rbac_ownership — Roles and ownership model

Date: 2025-12-13
Status: Accepted

Context
I want a minimal but realistic authorization story. It should be simple to demo and still mirror common production patterns.

Decision
I add `role: 'admin' | 'user'` to `User`. Admin can access and mutate everything. A regular user can only access what they own (their Containers and Items).

I implement a `@Roles(...)` decorator and a `RolesGuard` layered on top of `JwtAuthGuard`. I enforce ownership in service queries (filter by `ownerId`) and, where needed, in guards.

Why
- The pattern is familiar to reviewers and easy to audit.
- It scales if I later add organizations or projects.

Consequences
- I extend entities to carry ownership (e.g., `ContainerEntity.ownerId`) and update queries accordingly.
- Tests and seed data need to set explicit owners.
