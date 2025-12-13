# 0003_python_framework_fastapi — Why I chose FastAPI

Date: 2025-12-13
Status: Accepted

Context
I want a lightweight Python service for data normalization that’s fast to scaffold, type‑friendly, and easy to deploy.

Decision
I use FastAPI for the Python service runtime.

Why

- Type hints + pydantic‑style validation = great developer ergonomics.
- Built on Starlette/Uvicorn: performant async stack with simple deployment.
- Strong docs and community; trivial to containerize.

Alternatives I considered

- Flask: minimal but I would assemble extras myself (validation, async story).
- Django: powerful but heavy for this small service.

Trade‑offs

- Async model requires a bit of care with blocking code (not an issue for this demo).

Consequences

- The service is approachable for reviewers and integrates cleanly with Strawberry GraphQL.
