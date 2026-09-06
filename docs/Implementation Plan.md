# 🦫 Beaverr — Implementation Plan

Phase-by-phase build plan for the MVP. See `Project Description.md` for full product scope and `Folder Structure.md` / `Backend Development.md` / `Frontend Development.md` for the detailed architecture each phase implements against.

## Context

Beaverr's `/docs` describe an enterprise-grade, multi-tenant society management SaaS (18 backend modules, 4 frontend apps, AI microservice, K8s/Terraform). Building the entire documented platform is a multi-quarter effort for a solo developer, so scope is trimmed to a realistic MVP (see `Project Description.md` → MVP Scope (v1)).

**Standing decisions:**
- Web only for MVP (`resident-web` + `admin-web`); `mobile-app`/`guard-app` deferred, gate scanning done via a "Gate Console" page in `admin-web`.
- No separate Python AI microservice; auto-assign/reputation scoring run as plain TypeScript.
- Docs edited in place with 🔮 *Post-MVP* tags rather than a separate roadmap doc.

---

## Phase 0 — Trim the docs to MVP scope

- [x] Edit all four docs (`Project Description.md`, `Folder Structure.md`, `Backend Development.md`, `Frontend Development.md`) in place: MVP Scope (v1) section, roadmap compressed to 5 MVP phases, every deferred item tagged 🔮 *Post-MVP* rather than deleted.

## Phase 1 — Foundations

- [x] Shared types (`packages/types`) — User/Role, Society, Unit, `ApiResponse<T>` envelope.
- [x] Prisma schema (`services/api/prisma/schema.prisma`) — models needed through Phase 4 (`Society`, `User`, `Unit`, `Department`, `Service`, `Worker`, `ServiceBooking`, `Grievance`, `Visitor`, `Payment`, `Notification`, `NotificationPreference`). Marketplace and Phase-5-stretch models deliberately deferred until those phases start.
- [x] Backend infra — env/database/redis config, logger, `AppError`, pagination, auth/rbac/tenancy/error middleware, root `docker-compose.yml` (Postgres 16 + Redis 7), `.env.example`.
- [x] `auth` module — OTP (pluggable provider, console default), JWT access/refresh, guard username+password login.
- [x] `societies` module — 6-digit code, departments, gate-module toggle.
- [x] `residents` + `units` modules — CRUD, ownership transfer, CSV bulk import.
- [x] `prisma/seed.ts` — demo society, admin, guard, resident, units.
- [x] Frontend scaffolding — Next.js 15 apps for `resident-web`/`admin-web`, `packages/api-client`, brand tokens (Plus Jakarta Sans + Geist), shared UI components (`packages/ui`: Button, Input, Label, Card), styled auth flow and dashboard shells for both apps.
- [x] Small fixes — dropped redundant `redis` npm package (kept `ioredis`), pinned `prisma`/`@prisma/client` to `7.10.0`, swapped to `bcryptjs`, added `@prisma/adapter-pg` + `pg`.

**Verification:** `docker compose up` brings up Postgres + Redis; `pnpm --filter api dev` boots; `prisma migrate dev` + seed succeed; send-otp → verify-otp → me passes for a seeded resident; guard-login works; `resident-web`/`admin-web` boot, show login, and a real registration flow works end-to-end against the real API.

## Phase 2 — Core service loop

`services` (catalogue, Postgres search), `bookings` (state machine, SLA engine via BullMQ, rule-based auto-assign), `workers` (profiles, scheduling, reputation score). Resident-web service catalogue/booking flow/tracking (Socket.io status, no live GPS map). Admin-web residents/units/services/workers tables, bookings admin view + manual assign.

- [x] `services` module — catalogue CRUD, Postgres full-text-style search (name/description/subcategory), category filter, pagination. Catalogue browsing open to any authenticated role; create/update/delete gated to admins.
- [x] `bookings` module — state machine, BullMQ-backed SLA engine, rule-based auto-assign.
- [x] `workers` module — profiles, skills, availability, reputation scoring.
- [x] Resident-web service catalogue / booking flow / tracking (Socket.io live status).
- [x] Admin-web management tables (residents, units, services, workers, bookings) + manual assign UI.
- [x] Supabase-hosted Postgres wired as the deployment target (local Docker Postgres stays the dev DB); existing schema replayed and migration bookkeeping synced.

**Reminder for this phase:** keep dense data tables (`TanStack Table` grids, Gate Console) visually minimal and fast — motion/blur belongs on nav, hero, and auth screens, not on screens used many times a day.

## Phase 3 — Trust & safety loop

`grievances` (lifecycle, escalation), `visitors` (QR, walk-in, blacklist — via Gate Console), `notifications` (in-app + email only). Resident-web + admin-web pages for both.

- [x] `grievances` module — create/list/detail, admin assign + status lifecycle (`OPEN→IN_REVIEW→RESOLVED→CLOSED`), anonymous redaction, SLA escalation via BullMQ.
- [x] `visitors` + Gate Console — resident pre-approve (QR code) + approve/deny; guard walk-in/scan/exit; admin visitor log + blacklist.
- [x] `notifications` module — in-app inbox, preferences, pluggable email provider (console default), shared by grievances/visitors/bookings-SLA.
- [x] Resident-web: grievances, visitors, notifications pages.
- [x] Admin-web: grievances table, Gate Console page.

## Phase 4 — Money & basic reporting

`payments` (Razorpay test mode, webhooks, invoicing, dues/reminders), `analytics` (dashboard + reports straight from Postgres).

- [x] `payments` module — dues, Razorpay order + signature-verified webhook (status only ever set from the webhook), BullMQ due reminders (7d/3d/due/overdue).
- [x] `analytics` module — consolidated admin dashboard endpoint (open bookings, pending grievances, visitors today, dues collected/outstanding/overdue), straight Postgres aggregates.
- [x] Resident-web: payments page (dues, pay via Razorpay Checkout, history).
- [x] Admin-web: payments page (create due, table, summary cards) + real stats wired into the dashboard.

## Phase 5 — Stretch (only if time remains)

Events board, announcements, documents, community forum.

- [x] `events` module — create/list/RSVP, headcount tracking.
- [x] `announcements` module — create/list, read receipts for critical circulars.
- [x] `documents` module — publish/list (hosted URLs, no upload pipeline).
- [x] `forum` module — threads/replies, admin flag/remove moderation.
- [x] Resident-web + admin-web: single tabbed "Community" page per app (Events/Announcements/Documents/Forum).

## Final-stretch hardening pass

Full docs-vs-code cross-check, a codebase-wide review, and DB prep for a real test run.

- [x] Fixed a systemic validation bug: `zod`'s `.partial()` on a schema with `.default()` fields silently resets those fields on any partial update that omits them — found in `announcements`, `services`, and `workers` (the last was live and high-impact: admin-web's verify/available toggle buttons each flip one field, silently resetting the other).
- [x] Fixed a forum moderation bypass (removed threads stayed viewable/repliable by id), an unhandled Prisma error on double-cancelling an RSVP, N+1 queries in two Phase 5 list endpoints, events never filtering out past events, and a `datetime-local` timezone mismatch between browser and server.
- [x] Resident-web dashboard: real stat tiles instead of a leftover Phase-1 placeholder.
- [x] Admin-web: `/settings` page for the previously-frontend-less `societies` module (profile, gate module, departments).
- [x] Redis-backed rate limiting + Winston-based admin audit logging, both mounted globally.
- [x] Resident-facing booking reschedule (>4h before, reuses the existing state machine) and a forum "report" action for residents (previously only admin could flag).
- [x] Local Postgres reset and reseeded with sample data across every module for a clean test run; Supabase left untouched.

## Explicitly deferred (Future Extensions in docs, not built now)

Marketplace/Community Economy Layer, real ML-based AI microservice, `mobile-app` + `guard-app` (Expo), Digio/Signzy KYC, WhatsApp Business API, Mixpanel, Kubernetes + Terraform, Meilisearch/TimescaleDB/pgvector, OpenTelemetry, full Prometheus/Grafana/Loki stack.

## Verification

- **Phase 1:** see above.
- **Each later phase:** unit/integration tests pass for that module; manual browser walkthrough of the relevant Key E2E Scenario from `Project Description.md`'s Testing Strategy section.
