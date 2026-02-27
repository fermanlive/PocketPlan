# AGENTS.md - PocketPlan Development Guide

This file provides guidelines for agentic coding agents working on this codebase.

## Project Overview

PocketPlan is a Next.js 16 budget tracking application using React 19, Tailwind CSS 4, TypeScript, and Radix UI components.

## Build Commands

```bash
# Development
npm run dev          # Start Next.js dev server
npm run build        # Production build (includes TypeScript checking)
npm run start        # Start production server
npm run lint         # Run ESLint on entire project
npm run lint -- --fix  # Auto-fix linting issues

# Linting specific files/directories
npx eslint components/
npx eslint lib/financial-data.ts
```

**Type Checking**: TypeScript checking runs automatically during `npm run build`. To check types without building:
```bash
npx tsc --noEmit
```

**Tests**: There are no test scripts configured. To add tests, install Vitest or Jest:
```bash
npm install -D vitest @testing-library/react @testing-library/dom jsdom
# Add to package.json: "test": "vitest", "test:ui": "vitest --ui"
```

## Code Style Guidelines

### General

- Use TypeScript with strict mode enabled
- Use Next.js App Router (app/ directory)
- Use "use client" directive for client components
- Prefer functional components with hooks

### Imports

Order imports as follows:
1. Node built-ins (none typically needed)
2. React/standard library
3. External packages (Radix UI, etc.)
4. Internal imports (@/lib, @/components)

```typescript
// Correct import order
import { useState } from "react"
import { Slot } from '@radix-ui/react-slot'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

Use type-only imports when appropriate:
```typescript
import type { BudgetCategory, ExpenseItem } from "@/lib/financial-data"
```

### Naming Conventions

- Components: PascalCase (e.g., `BudgetCategoryCard`, `MonthSidebar`)
- Hooks: camelCase starting with "use" (e.g., `useFinance`, `useState`)
- Types/Interfaces: PascalCase (e.g., `BudgetCategoryProps`)
- Utilities: camelCase (e.g., `cn`, `formatCOP`)
- Files: kebab-case (e.g., `budget-category-card.tsx`)

### Component Structure

Follow this pattern for components:
```typescript
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ComponentNameProps {
  // props with types
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // hook calls
  // derived state
  // handlers
  // render
}
```

### Styling with Tailwind

- Use `@/lib/utils.ts` `cn()` function to merge class names
- Use Tailwind CSS utility classes
- Use semantic color tokens: `text-foreground`, `bg-background`, `text-muted-foreground`
- Use Radix UI colors: `text-destructive`, `bg-primary`, `text-accent`

### Using Radix UI Components

Import from `@radix-ui/react-*` packages (already installed). Wrap with custom components in `components/ui/`:

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
```

### State Management

- Use React useState/useReducer for local state
- Use Context API for global state (see `lib/finance-context.tsx`)
- Keep context values stable with useCallback

### Error Handling

- Throw descriptive errors in hooks:
  ```typescript
  if (!ctx) throw new Error("useFinance must be inside FinanceProvider")
  ```
- Validate inputs before operations
- Use early returns for error conditions
- Use descriptive error messages that explain what went wrong

### TypeScript Patterns

- Use interfaces for object shapes
- Use type for unions, tuples, and type aliases
- Use `as` casting only when necessary
- Enable strict null checks

### Code Formatting

- Use double quotes for strings consistently
- Use trailing commas in arrays and objects
- Add spaces after keywords: `if ()`, `function ()`
- Use semicolons at the end of statements
- Format JSX with proper indentation (2 spaces)
- Use meaningful variable names that describe their purpose

### Path Aliases

Use `@/` prefix for relative imports from project root:
```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

### Data Layer

- Keep data types in `lib/financial-data.ts`
- Use Zod for validation (already installed)
- Generate unique IDs with helper functions

### Validation with Zod

Use Zod for form validation and data schemas:
```typescript
import { z } from "zod"

const expenseSchema = z.object({
  name: z.string().min(1),
  amount: z.number().int().positive(),
})
```

## Project Structure

```
/home/orlando/Documentos/PocketPlan/
├── app/                  # Next.js App Router pages
│   ├── globals.css       # Global Tailwind styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── ui/               # Reusable UI components (Radix wrappers)
│   └── *.tsx             # Feature components
├── lib/
│   ├── finance-context.tsx   # React Context for budget state
│   ├── financial-data.ts    # Data types and utilities
│   └── utils.ts             # cn() utility
├── hooks/                # Custom React hooks
├── styles/               # Additional styles
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## Common Tasks

### Adding a New UI Component

1. Create component in `components/ui/`
2. Use Radix UI primitive if available
3. Export both component and variants (if using cva)
4. Import in feature components

### Adding a New Feature

1. Create types in `lib/financial-data.ts`
2. Add context functions in `lib/finance-context.tsx`
3. Create component in `components/`
4. Import and use in `app/page.tsx`

### Running the App

```bash
npm run dev
```

The app will be available at http://localhost:3000
