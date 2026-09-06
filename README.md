# 🦫 Beaverr

**Where Houses Become Homes** — a full-stack residential society management platform.

Beaverr digitises the day-to-day operations of a housing society or residential community: booking a maintenance worker, approving a visitor at the gate, raising a grievance, paying dues — all from one system instead of a patchwork of WhatsApp groups, paper registers, and disconnected apps. Societies onboard with a unique 6-digit code, giving each one a clean, isolated tenant.

The long-term vision (fully documented in `/docs`) is a complete multi-tenant SaaS: resident + admin web portals, native mobile apps for residents and gate security, an internal service marketplace with rated/verified workers, AI-assisted maintenance prediction and worker auto-assignment, and a full observability/infra stack. That full scope is preserved in the docs as the north star, but this repo is currently building toward a trimmed **MVP** first — see below.

## Current status

All 5 MVP phases are built. Built so far:

- **Foundations** — multi-tenant Postgres schema (Prisma), Redis-backed sessions/rate-limits, JWT auth with OTP login (residents/admins) and username+password login (guards), RBAC + tenancy middleware, a demo society/admin/guard/resident seed.
- **Resident & admin web apps** — real Next.js 15 apps (not stubs): login/OTP/register flows, guard desk login, authenticated dashboard shells, shared component library.
- **Service catalogue** — backend module for browsing and managing a society's service catalogue (search, categories, admin-managed).
- **Bookings & workers** — booking state machine, BullMQ-backed SLA tracking, rule-based worker auto-assign, worker profiles/reputation scoring; resident-web catalogue browsing, booking flow, and live booking tracking (Socket.io) are built.
- **Admin-web management tables** — residents, units, services, workers, and bookings (with manual worker-assign) tables.
- **Hosted Postgres ready** — Supabase available as a deployment target alongside local Docker Postgres for dev.
- **Grievances** — complaint lifecycle (open → in review → resolved → closed), anonymous complaints, SLA escalation.
- **Visitors & Gate Console** — resident QR pre-approval, guard walk-in/scan/exit, blacklist enforcement, admin visitor log.
- **Notifications** — in-app inbox + pluggable email provider, used across grievances/visitors/bookings.
- **Payments & dues** — Razorpay test-mode orders, signature-verified webhook, BullMQ due reminders; resident payments page (pay via Razorpay Checkout), admin payments page + dashboard stats.
- **Basic analytics** — admin dashboard cards (open requests, pending grievances, visitors today, dues) straight from Postgres.
- **Community** — events (RSVP + headcount), announcements (read receipts for critical ones), documents, and a moderated community forum; one tabbed "Community" page per app.

All 5 MVP phases (see table below) are done. Remaining work is entirely 🔮 *Post-MVP* — see `docs/Implementation Plan.md` for the full phase breakdown.

> Payments note: the Razorpay integration is code-complete and signature-verification is live-tested, but order-creation/Checkout.js itself hasn't been exercised against a real Razorpay account (none available yet) — see `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`/`RAZORPAY_WEBHOOK_SECRET` in `.env.example`.

## MVP scope

Web only for now — `resident-web` + `admin-web`. Mobile apps (resident + gate guard) are deferred; gate/visitor scanning for MVP happens through a "Gate Console" page inside `admin-web` instead. Auto-assign and worker reputation scoring run as plain TypeScript formulas — no separate ML service for MVP.

| Phase | Scope |
|---|---|
| 1 — Foundations | Schema, infra, auth, societies, residents/units, web app scaffolding |
| 2 — Core service loop | Service catalogue, bookings (state machine + SLA + auto-assign), workers |
| 3 — Trust & safety | Grievances, visitors (Gate Console), notifications |
| 4 — Money & reporting | Payments (Razorpay test mode), analytics |
| 5 — Stretch | Events, announcements, documents, community forum |

Everything beyond MVP (service marketplace/community economy layer, ML-based AI features, native mobile apps, KYC integrations, WhatsApp Business API, Kubernetes/Terraform, full observability stack) is documented in `/docs` and tagged 🔮 *Post-MVP* — preserved as the long-term plan, not built yet.

## Tech stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Zustand
- **Backend:** Node.js/Express, Prisma ORM, PostgreSQL (Supabase-hosted for deployment, local Docker for dev), Redis, BullMQ
- **Auth:** JWT (access + refresh), phone+OTP for residents/admins, username+password for guards
- **Monorepo:** Turborepo + pnpm workspaces

## Project layout

```
apps/
  resident-web/   Resident-facing Next.js app
  admin-web/      Admin/staff-facing Next.js app
  mobile-app/     🔮 Post-MVP (Expo, not yet scaffolded)
  guard-app/      🔮 Post-MVP (Expo, not yet scaffolded)
services/
  api/            Express API — all backend modules live here
  ai-engine/      🔮 Post-MVP (deferred; scoring runs in-API for MVP)
packages/
  types/          Shared TypeScript types/DTOs
  api-client/     Shared Axios client (auth refresh, interceptors)
  ui/             Shared React components
  eslint-config/, typescript-config/   Shared tooling config
docs/             Full product spec, architecture, and phase-by-phase build plan
```

## Getting started

Requires Node.js, pnpm, and Docker.

```sh
pnpm install
docker compose up -d          # Postgres + Redis
cp .env.example services/api/.env   # fill in the values
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma db seed

pnpm --filter api dev          # API on :4000
pnpm --filter resident-web dev # :3000
pnpm --filter admin-web dev    # :3001
```

The seed script creates a demo society, admin, guard, and resident account — see `services/api/prisma/seed.ts` for credentials.

For deployment, point `DATABASE_URL` (pooled) and `DIRECT_URL` (unpooled, used for migrations) at a hosted Postgres provider — Supabase is the current target. Local dev is unaffected either way.

## Docs

`/docs` contains the full product spec (`Project Description.md`), architecture (`Backend Development.md`, `Frontend Development.md`, `Folder Structure.md`), and the phase-by-phase build plan (`Implementation Plan.md`).
