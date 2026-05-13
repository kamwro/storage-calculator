Generate a PR description in Markdown for the diff between `main` and the current branch, then write it to `pr-description.md` in the repo root.

---

**Step 1 — Gather the diff**

Run these commands in parallel:

```
git log main..HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD
```

---

**Step 2 — Analyse the changes**

Group every changed file into one or more of these sections. Only include sections that have actual changes — omit empty ones entirely.

| Section | What belongs here |
|---|---|
| **Database** | Migration files, entity schema changes (new columns, indexes, constraints) |
| **Backend** | NestJS controllers, services, DTOs, guards, modules, ports, use-cases |
| **Frontend** | Next.js pages, React components, API client (`lib/api.ts`), types (`types.ts`) |
| **Tests** | Unit specs (`*.spec.ts`), API E2E (`e2e/api/`), UI E2E (`e2e/ui/`) |
| **Chore** | Config files, `.gitignore`, docs (`CLAUDE.md`, `AGENTS.md`, `README.md`), tooling |

---

**Step 3 — Write the description**

Use this exact structure (omit any section that has no content):

```markdown
## <conventional-commit title, e.g. "feat: add isFavorite toggle to containers">

<One or two sentences: what the PR does and why, written for someone reading GitHub with no prior context.>

## Changes

### Database
- <bullet per meaningful change — schema change, migration safety note, effect on existing rows>

### Backend
- <bullet per meaningful change — name the class/method, describe what it does or enforces>

### Frontend
- <bullet per meaningful change — name the component/type, describe user-visible or structural effect>

### Tests
- <bullet per test file or group — count new cases and summarise what they cover>

### Chore
- <bullet per item — keep these short>

## Test plan

- [ ] <manual verification step — golden path first>
- [ ] <edge case or RBAC/auth check>
- [ ] <regression or build check, e.g. `pnpm run lint:all && pnpm run build:all`>
```

Rules for bullet content:
- Name the concrete thing changed (class, method, file, endpoint, component), not just the category
- One sentence per bullet — no sub-bullets
- Do not repeat information across sections
- Write in present tense ("adds", "enforces", "exposes", "updates")

---

**Step 4 — Write the file**

Write the finished description to `pr-description.md` in the repo root, overwriting any existing file.

Confirm the file was written and print the title line.
