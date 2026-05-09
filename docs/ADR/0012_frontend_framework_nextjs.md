# ADR-0012: Frontend Framework Next.js (App Router)

Date: 2026-05

Status: Accepted

Context

Initially, the frontend was built using React and Vite. However, as the project evolved to include more robust features, routing requirements, and API rewrites, we decided to migrate to Next.js.
The project is a full-stack monorepo containing a NestJS backend and a frontend application.

Decision

We choose Next.js 16 (App Router) with React 19 for the frontend.

Why Next.js (App Router)

- App Router: Next.js 16 provides a modern and efficient way to build applications, offering a clear mental model with Server Components and Client Components.
- Ecosystem & Routing: File-system-based routing simplifies navigation management compared to setting up React Router manually with Vite.
- React 19 Support: Seamless integration with the latest React features.
- Configuration: Built-in support for environment variables and API rewrites in `next.config.ts` makes it easy to proxy requests to our NestJS backend on port 3000.

Alternatives Considered

- Vite + React (Previous choice): Great for single-page applications but lacks built-in routing and advanced rendering capabilities. Setting up complex routing and API proxies requires more manual configuration.
- Remix: A strong contender for server-rendered React applications, but Next.js App Router has broader ecosystem support and team familiarity.

Consequences

- Moving from a pure SPA to a framework with built-in SSR/SSG capabilities, although initially, all our pages and components are Client Components (`'use client'`).
- We can easily introduce Server Components in the future if needed (after migrating auth from localStorage to cookies/sessions).
- Requires updating the build process and CI/CD pipelines to accommodate Next.js (`next build`) instead of Vite.
