# 0004_strawberry_graphql_choice — Why I chose Strawberry GraphQL

Date: 2025-12-13
Status: Accepted

Context
For the Python service I want a GraphQL layer that is quick to stand up, type‑first, and easy to demo. I also want the schema to stay in sync with code without a lot of boilerplate.

Decision
I use Strawberry GraphQL for the Python service.

Why
- Type‑first schema: I define types in Python code and Strawberry generates the schema — fewer moving parts.
- Great DX for demos: I can expose a mutation (e.g., `normalize`) with minimal code and get GraphiQL out of the box.
- Plays well with FastAPI: integration is straightforward and well‑documented.

Alternatives I considered
- Graphene: widely used, but I prefer Strawberry’s type‑first approach and modern ergonomics.
- Ariadne: schema‑first is fine, but I prefer to keep strong typing in code for this demo.

Trade‑offs
- Smaller ecosystem than Graphene, but sufficient for my use case.

Consequences
- Faster delivery of a typed GraphQL API for the demo service with minimal boilerplate.
