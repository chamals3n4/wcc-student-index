# AGENTS.md

## Project

Next.js 16 (App Router) + React 19 student management CRUD app for Wellawa Central College. Uses shadcn/ui v4 (`base-vega` style), PostgreSQL via Drizzle ORM, Cloudflare R2 for image uploads, and Asgardeo (WSO2) for auth.

## Commands

```
pnpm dev          # Next.js dev with Turbopack
pnpm build        # Production build
pnpm lint         # ESLint (flat config v9)
pnpm format       # Prettier
pnpm typecheck    # tsc --noEmit
pnpm db:generate  # drizzle-kit generate (schema -> migrations)
pnpm db:migrate   # drizzle-kit migrate (apply migrations)
```

## Architecture

- **`db/schema.ts`** — single `students` table, Drizzle `pgTable`
- **`db/index.ts`** — Drizzle instance via `pg.Pool`, requires `DATABASE_URL`
- **`app/api/students/`** — RESTful CRUD. List GET is public; create/update/delete/single-get require auth via `requireAuth()`
- **`app/api/upload/`** — image upload to R2, returns `imageUrl`
- **`hooks/use-students.ts`** — TanStack Query hooks (staleTime: 30s, refetchOnWindowFocus: false)
- **`lib/auth.ts`** — `requireAuth()` wraps Asgardeo token validation
- **`proxy.ts`** — Asgardeo middleware, matches all non-static routes

## Routing details

- Student identity in API params is `indexNumber`, not the UUID `id`
- Route params use `Promise<{ id: string }>` (Next.js 16 async params)
- Pages: `/` (dashboard), `/students` (table), `/students/new`, `/students/[id]` (view), `/students/[id]/edit`
- Auth guarded: all routes redirect to `/sign-in` unless signed in (handled by AppShell)

## Key conventions

- Path alias `@/*` → `./*`
- Tailwind CSS v4 (no `tailwind.config.js`; uses `@tailwindcss/postcss` plugin)
- Prettier: no semicolons, double quotes, trailing commas `es5`
- shadcn components are added via `npx shadcn@latest add <name>`
- No test infrastructure; lint + typecheck before build is sufficient
