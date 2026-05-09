# ADR-0008: CI Restructure per Service + SBOM and Vulnerability Scanning

Date: 2025-12-14

Status: Accepted

Context

The repository is a small monorepo with three parts:

- Backend (NestJS/TypeScript)
- Frontend (React/Vite/TypeScript)
- Optional Python GraphQL normalizer (FastAPI + Strawberry)

Previously, we had a single CI workflow. We want clearer ownership, faster runs, and security visibility. The goal is to:

- Split CI by service (backend, frontend, python) with explicit lint/build/test steps.
- Add SBOM generation and vulnerability scanning for each service.
- Provide an on-demand (manual) end-to-end (E2E) workflow that boots services and runs Playwright tests.

Decision

1. Separate GitHub Actions workflows
   - `.github/workflows/backend.yml`: lint (ESLint), build, unit tests (Jest), SBOM + vuln scan.
   - `.github/workflows/frontend.yml`: lint (ESLint), build, SBOM + vuln scan.
   - `.github/workflows/python.yml`: lint (Ruff), Python syntax check, basic unittest discovery, SBOM + vuln scan.
   - `.github/workflows/e2e.yml`: manual trigger via `workflow_dispatch`, provisions Postgres, starts backend + frontend, runs migrations/seed, installs Playwright browsers, and runs E2E tests (api + ui). Artifacts (reports/traces) are uploaded.

2. SBOM generation tool: Syft (via `anchore/sbom-action`)
   - Produces SPDX JSON SBOMs suitable for archiving and downstream tools.
   - Fast, zero-config for Node and Python projects; detects from lockfiles and source.
   - Well-maintained and widely adopted in OSS and enterprises.

3. Vulnerability scanning tool: Grype (via `anchore/scan-action`)
   - Consumes project directory/lockfiles or container images; outputs SARIF for GitHub Code Scanning.
   - Good signal-to-noise for Node/Python ecosystems with frequent DB updates.
   - Configured to not fail builds by default (`fail-build: false`) to surface results without blocking iteration; policy can be tightened later.

4. Linters
   - TypeScript: ESLint with curated rules per package (already present). Chosen for broad ecosystem support and ability to codify style + correctness.
   - Python: Ruff for speed and batteries-included defaults; reduces CI time vs. flake8 + plugins.

5. E2E tests: Playwright
   - Already used in the repo. The workflow installs browsers and runs both `api` and `ui` projects.
   - Makes it easy to capture traces, screenshots, and videos on failure, which the workflow uploads as artifacts.

Alternatives Considered

- SBOM
  - CycloneDX (OWASP) via `cyclonedx-github-actions` or `cyclonedx-npm`. Also solid; we chose Syft for speed, multi-ecosystem support, and seamless pairing with Grype. We can emit CycloneDX later if required by compliance.

- Scanning
  - Snyk/GitHub Dependabot/CodeQL: All viable. Snyk is proprietary (license/seat), Dependabot focuses on dependency updates, and CodeQL targets code scanning rather than dependency CVEs. Grype complements these by scanning dependencies from SBOM/lockfiles and emitting SARIF.

- Test orchestrations
  - Docker Compose matrix for services. This may be preferable when we containerize services. For now, the monorepo uses dev servers; the E2E workflow reflects that and remains lightweight.

Consequences

- Clearer ownership and faster feedback: only changed services run their CI.
- Security visibility: SBOM artifacts per service and SARIF vulnerability reports in GitHub Security tab.
- Manual E2E: repeatable, on-demand environment to validate the whole flow.

Follow-ups

- Optionally add CodeQL for code-level security analysis.
- Add severity thresholds to fail builds on critical vulnerabilities once baseline is addressed.
- Consider containerizing services and scanning built images (Syft/Grype work well with images too).
