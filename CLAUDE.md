# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PocketPlan is a full-stack personal finance/budget tracking app. It targets Colombian users (amounts in COP). The frontend is a Next.js 16 app; the backend is an Express.js REST API using file-based JSON storage (no live MongoDB connection in current setup).

## Development Commands

### Backend (run from `/backend`)
```bash
npm run dev     # Start Express server (port 4000) with nodemon
npm start       # Start without auto-restart
```

### Frontend (run from `/frontend`)
```bash
npm run dev     # Next.js dev server (port 3000)
npm run build   # Production build (also runs TypeScript checks)
npm run lint    # ESLint
npm run lint -- --fix   # Auto-fix lint issues
npx tsc --noEmit        # Type-check without building
```

No test suite is configured. To add tests: `npm install -D vitest @testing-library/react @testing-library/dom jsdom`.

## Architecture

### Monorepo Structure
```
PocketPlan/
├── backend/    # Express.js REST API
└── frontend/   # Next.js 16 App Router
```

### Backend

- **Entry:** `backend/src/server.js` — Express on port 4000, CORS enabled, routes mounted at `/api`
- **Data:** File-based mock storage in `backend/data/mock.json` (monthly data) and `backend/data/subcategories.json`. Mongoose models exist but the current service layer delegates to `MockDataService` which reads/writes JSON files.
- **Service layer:** `MonthDataService` wraps `MockDataService`; routes call the service, not the DB directly.
- **Routes:** Defined in `backend/src/routes/monthData.routes.js`. Pattern: `/api/month-data`, `/api/subcategories`, and nested item/category routes under `/api/month-data/:monthId/categories/:categoryId/items/:itemId`.

### Frontend

- **Framework:** Next.js 16 App Router (`app/` directory). Client-heavy — most components are `"use client"`.
- **Global state:** `lib/finance-context.tsx` (`FinanceProvider` + `useFinance` hook). All data fetching, CRUD operations, and optimistic updates live here. Components consume this context.
- **Data types:** Defined in `lib/financial-data.ts`. Extend types here before adding features.
- **UI components:** `components/ui/` — thin Radix UI wrappers (shadcn/ui pattern). Feature components live directly in `components/`.
- **Styling:** Tailwind CSS 4 with semantic tokens (`text-foreground`, `bg-background`, `text-muted-foreground`). Use `cn()` from `lib/utils.ts` for conditional classes.
- **Forms:** React Hook Form + Zod validation.
- **Charts:** Recharts.
- **API base URL:** Hardcoded to `http://localhost:4000/api` inside `finance-context.tsx`.

### Adding a New Feature (typical flow)
1. Add TypeScript types to `lib/financial-data.ts`
2. Add context methods (fetch/CRUD) to `lib/finance-context.tsx`
3. Create component in `components/` using `useFinance()` hook
4. Wire into `app/page.tsx`

## Code Conventions

- **Files:** kebab-case (e.g., `budget-category-card.tsx`)
- **Components/Types:** PascalCase; **hooks:** camelCase prefixed with `use`
- **Strings:** double quotes; **indentation:** 2 spaces; semicolons required
- Use type-only imports: `import type { BudgetCategory } from "@/lib/financial-data"`
- Path alias `@/` maps to the frontend root — always use it for internal imports
- `next.config.mjs` sets `typescript: { ignoreBuildErrors: true }` — TypeScript errors won't fail the build, but run `npx tsc --noEmit` to catch them manually
