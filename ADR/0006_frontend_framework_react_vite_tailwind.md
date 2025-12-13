# 0006_frontend_framework_react_vite_tailwind — Why I chose React + Vite + Tailwind

Date: 2025-12-13
Status: Accepted

Context
I want a familiar, fast front‑end stack that’s easy to spin up, easy to reason about in code review, and simple to style without heavy component frameworks.

Decision
I use React with Vite for tooling and Tailwind CSS for styling.

Why React
- Ubiquity: reviewers instantly understand component patterns and hooks.
- Ecosystem: plenty of lightweight libs for forms, routing, and data fetching.

Why Vite
- Developer experience: instant server start, fast HMR, minimal config.
- Simplicity: works great with TypeScript and React out of the box.

Why Tailwind
- Speed: utility classes let me style quickly without context‑switching to separate stylesheets.
- Consistency: a shared design token system from day one.
- Size: no heavy component framework; I can still add headless UI later if I need dialogs/menus.

Alternatives I considered
- Next.js: great, but SSR/ISR is overkill for a small demo.
- CRA: slower tooling and dated defaults compared to Vite.
- Component kits (MUI/Ant): heavy visual footprint and theming overhead for a small project.

Trade‑offs
- Tailwind utility classes in JSX are verbose; I mitigate with small composable components.
- React without a router means I’ll add routing later if needed (or keep a simple single‑page layout for the demo).

Consequences
- Fast iteration loop and small bundle for a demo.
- Clean, simple UI that’s “pretty enough” without over‑engineering.