# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Humand Perks — an employee benefits platform with 3 independent Next.js apps sharing a single Supabase (PostgreSQL) database. Built for a hackathon. UI is in Spanish.

## Architecture

Three separate Next.js 16 apps (App Router), each deployed independently to Vercel:

- **perks-app/** — Mobile employee app (port 3001). Wallet, benefits catalog, redemption with QR vouchers, course completion for credit rewards.
- **perks-web/** — Desktop/web version (port 3002). Same features as perks-app with SSR support via `@supabase/ssr` middleware.
- **perks-admin/** — Admin dashboard (port 3003). Single-page app with credit management, benefit CRUD, auto-rules, analytics charts (Recharts).

There is **no root package.json** or workspace config. Each app has its own `node_modules/` and `pnpm-lock.yaml`.

### Data Layer

All apps call Supabase directly from the client (no API routes). Each app has its own `lib/supabase.ts` with shared helper functions (`getWallet`, `getBenefits`, `redeemBenefit`, `loadCredits`, `getDashboard`, etc.). These files are duplicated, not shared — changes must be synced manually.

Key tables: `users`, `wallets`, `transactions`, `benefits`, `courses`, `course_completions`, `auto_rules`, `bulk_history`.

Demo uses hardcoded user ID `u_maria01`. No authentication is implemented.

### UI Stack

- Tailwind CSS 4 + Radix UI components (shadcn/ui pattern in `components/ui/`)
- Lucide React for icons, Sonner for toasts, next-themes for dark mode
- Class Variance Authority + clsx + tailwind-merge for className composition
- Humand brand primary color: `#4B5EAA`

## Development Commands

Each app uses the same commands (run from within the app directory):

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build (TS errors are ignored via next.config.mjs)
npm run lint     # ESLint
```

Install dependencies per app: `cd perks-app && npm install`

## Environment Variables

Supabase credentials are hardcoded in each `lib/supabase.ts` for demo purposes. In production, set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Key Patterns

- All interactive components use `"use client"` directive
- Mobile apps render inside a `max-w-[420px]` container with iOS-style status bar
- Voucher codes follow format `PERKS-{PREFIX}-{RANDOM6}` with 30-day expiration
- Currency is "créditos" (not USD) — a virtual credit system
- Benefits have categories: Salud, Educación, Bienestar, Gastronomía, Entretenimiento
- `resetDemo()` function resets all wallets to $20 for demo resets

## Deployment

Three separate Vercel projects, each with Root Directory set to its app folder (`perks-app`, `perks-web`, `perks-admin`).
