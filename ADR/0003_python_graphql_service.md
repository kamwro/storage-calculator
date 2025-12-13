# 0003_python_graphql_service — Python data processing via GraphQL

Date: 2025-12-13
Status: Accepted

Context
I want a separate service that takes raw data and returns normalized Item Types/Items. I also want to showcase polyglot architecture in my portfolio and keep the integration simple to reason about.

Decision
I build a small Python service using FastAPI with Strawberry GraphQL, and I expose a `mutation normalize(source: String!, payload: JSON!): NormalizeResult!`.

Why I chose FastAPI

- Developer ergonomics: type hints + pydantic‑style validation feel productive.
- Performance: built on Starlette/Uvicorn; good enough for a demo and beyond.
- Ecosystem: straightforward to containerize and deploy; plenty of examples.

Why I chose Strawberry GraphQL

- Type‑first schema: I define the schema in Python types; it stays in sync with code.
- Batteries included: schema generation, GraphiQL, and simple resolvers without heavy boilerplate.
- Demo friendliness: very quick to stand up a mutation with proper types.

Auth
In dev I use a shared service key header. This keeps setup minimal while being explicit about trust boundaries.

Integration pattern
I start with the backend calling the Python service (pull) to normalize a payload on demand. I can later add a push flow where Python posts results back.

Consequences

- I get clean separation of concerns and show language diversity.
- There’s extra operational overhead (another service), but the docs make it optional for local dev.
