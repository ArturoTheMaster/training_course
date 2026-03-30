# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Docs-First Rule

**IMPORTANT:** Before generating any code, always read the relevant documentation file in the `/docs` directory first. These docs define conventions, patterns, and decisions specific to this project that must be followed. If a relevant doc exists for the area you are working in (e.g., UI, API, database), consult it before writing any code.

### Coding Standards Docs

| Area | Doc |
|------|-----|
| Data fetching, database queries, user data isolation | [`docs/data-fetching.md`](docs/data-fetching.md) |
| Data mutations, Server Actions, Zod validation | [`docs/data-mutation.md`](docs/data-mutation.md) |
| UI components, styling, layout conventions | [`docs/ui.md`](docs/ui.md) |
| Authentication, user identity, route protection | [`docs/auth.md`](docs/auth.md) |

## Architecture

This is a **Next.js 16 App Router** project with TypeScript and Tailwind CSS v4.

- **`app/`** — All routes and layouts (Next.js App Router conventions)
  - `layout.tsx` — Root layout with Geist fonts and global metadata
  - `page.tsx` — Home route
  - `globals.css` — Global styles with Tailwind v4 (`@import "tailwindcss"`)
- **`public/`** — Static assets served at root

**Path alias:** `@/*` maps to the project root (e.g., `@/app/...`, `@/components/...`).

**Tailwind CSS v4** is configured via PostCSS (`@tailwindcss/postcss`) — no `tailwind.config.*` file; configuration lives in CSS.

**ESLint** uses flat config format (`eslint.config.mjs`) with `next/core-web-vitals` and `next/typescript` presets.
