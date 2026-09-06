# 🦫 Beaverr — Backend Development Guide

> **Stack:** Node.js 20 + Express.js + TypeScript + PostgreSQL + Prisma + Redis + Socket.io + BullMQ + FastAPI (AI)

> **MVP note:** See `Project Description.md` → MVP Scope (v1) for the active phase plan. For MVP: no separate FastAPI service (§15 below is deferred — auto-assign/reputation scoring run as plain TypeScript in `bookings`/`workers`), no Meilisearch (§4 search uses Postgres), and `notifications` (§12) only sends in-app + email — push/SMS/WhatsApp wait for a mobile app. Modules `marketplace` (§10) is fully deferred; `events`/`forum`/`announcements`/`documents`/`emergency` (§8, §9, §13, §14) are stretch goals after the core loop (auth → residents/units → services/bookings/workers → grievances/visitors/notifications → payments/analytics) is solid.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Authentication & Authorization](#1-authentication--authorization)
3. [Society & Onboarding](#2-society--onboarding)
4. [Resident & Unit Management](#3-resident--unit-management)
5. [Service Catalogue & Booking](#4-service-catalogue--booking)
6. [Worker Management](#5-worker-management)
7. [Grievance Management](#6-grievance-management)
8. [Visitor & Gate Management](#7-visitor--gate-management)
9. [Events Management](#8-events-management)
10. [Community Forum](#9-community-forum)
11. [Marketplace](#10-marketplace)
12. [Payments & Billing](#11-payments--billing)
13. [Notifications](#12-notifications)
14. [Announcements & Documents](#13-announcements--documents)
15. [Emergency & SOS](#14-emergency--sos)
16. [AI Microservice (FastAPI)](#15-ai-microservice-fastapi)
17. [Admin Analytics & Reports](#16-admin-analytics--reports)
18. [Real-Time (Socket.io)](#17-real-time-socketio)
19. [Background Jobs (BullMQ)](#18-background-jobs-bullmq)
20. [Security & Middleware](#19-security--middleware)
21. [AppError Class & Error Codes](#20-apperror-class)
22. [Feature Flag Middleware](#21-feature-flag-middleware)

---

## Project Structure

> The API lives at `services/api/` inside the Beaverr monorepo. The AI engine lives separately at `services/ai-engine/`. See `folder_structure.md` for the full repo layout.

```
services/api/
├── src/
│   ├── config/
│   │   ├── env.ts              # Zod-validated env variables
│   │   ├── database.ts         # Prisma client singleton
│   │   ├── redis.ts            # Redis client (ioredis)
│   │   └── storage.ts          # S3 / Cloudflare R2 client
│   │
│   ├── modules/                # One folder per domain
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── auth.types.ts
│   │   ├── societies/          # (was: society/)
│   │   ├── residents/          # (was: users/)
│   │   ├── units/
│   │   ├── services/
│   │   ├── bookings/
│   │   ├── workers/
│   │   ├── grievances/
│   │   ├── visitors/
│   │   ├── events/
│   │   ├── forum/
│   │   ├── marketplace/
│   │   ├── payments/
│   │   ├── notifications/
│   │   ├── announcements/
│   │   ├── documents/
│   │   ├── emergency/
│   │   └── analytics/
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── tenancy.middleware.ts   # Injects societyId from JWT
│   │   ├── rateLimit.middleware.ts
│   │   ├── upload.middleware.ts    # Multer config
│   │   ├── audit.middleware.ts     # Admin action logger
│   │   └── error.middleware.ts
│   │
│   ├── jobs/                   # BullMQ queue + worker definitions
│   │   ├── queues.ts           # Queue instances (notifications, billing, etc.)
│   │   ├── notification.job.ts
│   │   ├── billing.job.ts
│   │   ├── booking.job.ts
│   │   ├── grievance.job.ts
│   │   ├── ai.job.ts
│   │   ├── media.job.ts
│   │   ├── report.job.ts
│   │   └── announcement.job.ts
│   │
│   ├── sockets/                # Socket.io namespace + event handlers
│   │   ├── index.ts
│   │   ├── visitor.socket.ts
│   │   ├── booking.socket.ts
│   │   ├── emergency.socket.ts
│   │   └── notification.socket.ts
│   │
│   ├── routes/
│   │   └── index.ts            # Mounts all module routers
│   │
│   ├── utils/
│   │   ├── logger.ts           # Winston logger
│   │   ├── helpers.ts
│   │   ├── otp.ts
│   │   └── pagination.ts
│   │
│   ├── app.ts                  # Express app setup, middleware stack
│   └── server.ts               # HTTP server + Socket.io attach + BullMQ start
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Module File Responsibilities

Every module follows the same 6-file pattern:

| File | Role |
|------|------|
| `*.controller.ts` | Parse req/res, call service, return HTTP response |
| `*.service.ts` | Business logic, orchestration, calls repository + external services |
| `*.repository.ts` | All Prisma DB queries — no business logic here |
| `*.routes.ts` | Route definitions with middleware applied per endpoint |
| `*.validator.ts` | Zod schemas for request body/query/params |
| `*.types.ts` | TypeScript interfaces and enums for the module |

---

## 1. Authentication & Authorization

### Roles
`RESIDENT` · `GUARD` · `DEPT_HEAD` · `SOCIETY_ADMIN` · `SUPER_ADMIN`

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user with society code | Public |
| POST | `/api/auth/send-otp` | Send OTP to phone via MSG91 | Public |
| POST | `/api/auth/verify-otp` | Verify OTP → issue JWT access + refresh tokens | Public |
| POST | `/api/auth/login` | Login with phone + OTP | Public |
| POST | `/api/auth/refresh` | Rotate refresh token → new access token | Public |
| POST | `/api/auth/guard-login` | Guard desk login (username + password, not OTP) | Public |
| POST | `/api/auth/logout` | Invalidate refresh token in Redis | Auth |
| GET | `/api/auth/me` | Get current user profile | Auth |
| PATCH | `/api/auth/me` | Update profile (name, avatar, preferences) | Auth |
| POST | `/api/auth/change-phone` | Request phone number change (OTP both numbers) | Auth — 🔮 *Post-MVP, not built* |

### Implementation Notes

- **Access token:** JWT, 15-minute expiry, contains `userId`, `societyId`, `role`
- **Refresh token:** 7-day expiry, stored as HttpOnly cookie, hashed copy in Redis
- **OTP:** 6-digit numeric, stored in Redis with 5-minute TTL, max 3 attempts then 15-min cooldown
- **RBAC middleware:** `requireRole(...roles)` checks JWT role against allowed roles per route
- **Multi-tenancy guard:** middleware injects `societyId` from JWT and appends to all DB queries via Prisma middleware

---

## 2. Society & Onboarding

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/super-admin/societies` | Create new society, generate 6-digit code | SUPER_ADMIN |
| GET | `/api/super-admin/societies` | List all societies with stats | SUPER_ADMIN |
| GET | `/api/super-admin/societies/:id` | Get society detail | SUPER_ADMIN |
| PATCH | `/api/super-admin/societies/:id` | Update society config | SUPER_ADMIN |
| DELETE | `/api/super-admin/societies/:id` | Deactivate society | SUPER_ADMIN |
| GET | `/api/society/validate-code/:code` | Validate 6-digit society code before signup | Public |
| GET | `/api/society/profile` | Get current society profile | Auth |
| PATCH | `/api/society/profile` | Update society settings | SOCIETY_ADMIN |
| PATCH | `/api/society/gate-module` | Toggle restricted entry on/off | SOCIETY_ADMIN |
| POST | `/api/society/departments` | Create department (Maintenance, Security, etc.) | SOCIETY_ADMIN |
| GET | `/api/society/departments` | List all departments | Auth |
| PATCH | `/api/society/departments/:id` | Update department info | SOCIETY_ADMIN |
| DELETE | `/api/society/departments/:id` | Delete department | SOCIETY_ADMIN |

---

## 3. Resident & Unit Management

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/residents` | List all residents (paginated, filterable) | SOCIETY_ADMIN, DEPT_HEAD |
| POST | `/api/admin/residents` | Create single resident | SOCIETY_ADMIN |
| POST | `/api/admin/residents/bulk` | Bulk import residents via CSV | SOCIETY_ADMIN |
| GET | `/api/admin/residents/:id` | Get resident detail | SOCIETY_ADMIN |
| PATCH | `/api/admin/residents/:id` | Update resident details | SOCIETY_ADMIN |
| PATCH | `/api/admin/residents/:id/suspend` | Suspend/unsuspend resident account | SOCIETY_ADMIN |
| DELETE | `/api/admin/residents/:id` | Soft-delete resident | SOCIETY_ADMIN |
| GET | `/api/admin/units` | List all units | SOCIETY_ADMIN |
| POST | `/api/admin/units` | Create unit | SOCIETY_ADMIN |
| PATCH | `/api/admin/units/:id` | Update unit (type, block, floor) | SOCIETY_ADMIN |
| POST | `/api/admin/units/:id/transfer` | Ownership transfer (sold/rented, invite new occupant) | SOCIETY_ADMIN |
| GET | `/api/residents/:id/vehicles` | Get resident's registered vehicles | Auth |
| POST | `/api/residents/vehicles` | Register vehicle | RESIDENT |
| PATCH | `/api/residents/vehicles/:id` | Update vehicle | RESIDENT |
| DELETE | `/api/residents/vehicles/:id` | Remove vehicle | RESIDENT |
| GET | `/api/society/directory` | Opt-in resident directory | Auth |

### CSV Bulk Import
- `POST /api/admin/residents/bulk` accepts `multipart/form-data` with CSV file
- Parsed server-side with `csv-parse`; rows validated with Zod schema
- Returns import summary: `{ success: N, failed: N, errors: [...] }`
- Sends welcome SMS/email to each successfully created resident via BullMQ job

---

## 4. Service Catalogue & Booking

### Service Catalogue

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/services` | List all active services (filterable by category/subCategory) | Auth |
| GET | `/api/services/:id` | Get service detail with available workers | Auth |
| POST | `/api/admin/services` | Create service | SOCIETY_ADMIN |
| PATCH | `/api/admin/services/:id` | Update service | SOCIETY_ADMIN |
| DELETE | `/api/admin/services/:id` | Deactivate service | SOCIETY_ADMIN |
| GET | `/api/services/categories` | Get all categories and subcategories | Auth |
| GET | `/api/services/search?q=` | Full-text search — Postgres `ILIKE`/`tsvector` for MVP (🔮 *Post-MVP:* Meilisearch) | Auth |

### Booking

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create service booking | RESIDENT |
| GET | `/api/bookings` | List my bookings (paginated) | RESIDENT |
| GET | `/api/bookings/:id` | Get booking detail + tracking | Auth |
| PATCH | `/api/bookings/:id/reschedule` | Reschedule (up to 4 hours before) | RESIDENT |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking | RESIDENT |
| POST | `/api/bookings/:id/rate` | Rate completed booking (1–5 stars + note) | RESIDENT |
| GET | `/api/admin/bookings` | All bookings with filters | SOCIETY_ADMIN, DEPT_HEAD |
| PATCH | `/api/admin/bookings/:id/assign` | Manually assign worker | SOCIETY_ADMIN, DEPT_HEAD |
| PATCH | `/api/admin/bookings/:id/status` | Update booking status | SOCIETY_ADMIN, DEPT_HEAD, GUARD |

### SLA Engine Logic
- On booking creation: calculate `slaDeadline = scheduledAt + service.slaHours`
- BullMQ job scheduled at `slaDeadline - 1hr` to check status; if not COMPLETED → flag admin
- Auto-escalation: if admin unresponded for `slaDeadline + 2hr` → push to DEPT_HEAD then SOCIETY_ADMIN

### Auto-Assignment Algorithm
```
1. Filter workers: skill ⊇ service.subCategory AND availability covers scheduledAt
2. Score = (reputationScore × 0.5) + (1 / currentWorkload × 0.3) + (completedJobs × 0.2)
3. Assign highest scorer → notify worker via push + SMS
4. Worker confirms within 30 min OR system re-assigns next best worker
5. If no worker found → flag admin for manual assignment
```

---

## 5. Worker Management

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/workers` | List all workers with stats | SOCIETY_ADMIN, DEPT_HEAD |
| POST | `/api/admin/workers` | Register new worker | SOCIETY_ADMIN |
| GET | `/api/admin/workers/:id` | Worker detail with performance data | SOCIETY_ADMIN, DEPT_HEAD |
| PATCH | `/api/admin/workers/:id` | Update worker profile | SOCIETY_ADMIN |
| DELETE | `/api/admin/workers/:id` | Deactivate worker | SOCIETY_ADMIN |
| GET | `/api/admin/workers/:id/schedule` | View worker availability calendar | SOCIETY_ADMIN, DEPT_HEAD |
| PATCH | `/api/admin/workers/:id/availability` | Set availability windows and off days | SOCIETY_ADMIN |
| POST | `/api/admin/workers/:id/verify` | Mark worker as KYC-verified | SOCIETY_ADMIN |
| GET | `/api/workers/:id/public` | Public profile (visible to residents during booking) | Auth |
| PATCH | `/api/workers/:id/location` | Update real-time GPS location | GUARD (worker sub-app) |

### Reputation Score Recalculation
Triggered after every booking rating via BullMQ job:
```
reputationScore = (avgRating × 40) + (slaComplianceRate × 35) + (zeroComplaintBonus × 15) + (tenureBonus × 10)
```
Capped 0–100. Workers below score 30 → performance improvement flag raised automatically.

---

## 6. Grievance Management

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/grievances` | Raise new complaint | RESIDENT |
| GET | `/api/grievances` | My complaints with status | RESIDENT |
| GET | `/api/grievances/:id` | Get complaint detail + timeline | Auth |
| PATCH | `/api/grievances/:id/media` | Add photo/video evidence | RESIDENT |
| GET | `/api/admin/grievances` | All grievances (filterable by type, status, priority) | SOCIETY_ADMIN, DEPT_HEAD |
| PATCH | `/api/admin/grievances/:id/assign` | Assign to department | SOCIETY_ADMIN, DEPT_HEAD |
| PATCH | `/api/admin/grievances/:id/status` | Update status (OPEN → IN_REVIEW → RESOLVED → CLOSED) | SOCIETY_ADMIN, DEPT_HEAD |
| POST | `/api/admin/grievances/:id/notes` | Add internal note (invisible to resident) | SOCIETY_ADMIN, DEPT_HEAD |
| PATCH | `/api/admin/grievances/:id/resolve` | Close with resolution summary | SOCIETY_ADMIN, DEPT_HEAD |
| GET | `/api/admin/grievances/analytics` | Monthly analytics: common issues, avg resolution time | SOCIETY_ADMIN |

### Notes
- Anonymous complaints: `isAnonymous: true` hides `raisedByUserId` from all admin views except SUPER_ADMIN
- Media uploads: Multer → validate MIME type + size → virus scan → upload to S3/R2 → store URL
- Auto-escalation: BullMQ checks unresolved grievances past SLA every hour

---

## 7. Visitor & Gate Management

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/visitors/pre-approve` | Resident creates pre-approved visitor → generates QR | RESIDENT |
| GET | `/api/visitors` | My upcoming / past visitors | RESIDENT |
| POST | `/api/visitors/whitelist` | Add domestic staff to recurring pass | RESIDENT |
| GET | `/api/visitors/whitelist` | My whitelisted staff/frequent visitors | RESIDENT |
| DELETE | `/api/visitors/whitelist/:id` | Remove from whitelist | RESIDENT |
| POST | `/api/gate/walkin` | Security logs walk-in visitor (name, photo, vehicle) | GUARD |
| GET | `/api/gate/scan/:qrToken` | Scan QR → validate and log entry | GUARD |
| PATCH | `/api/gate/visitors/:id/approve` | Resident approves walk-in | RESIDENT |
| PATCH | `/api/gate/visitors/:id/deny` | Resident denies walk-in | RESIDENT |
| PATCH | `/api/gate/visitors/:id/exit` | Security logs visitor exit | GUARD |
| GET | `/api/admin/visitors` | Full visitor log (filterable, exportable CSV) | SOCIETY_ADMIN, GUARD |
| POST | `/api/admin/visitors/blacklist` | Blacklist a visitor | SOCIETY_ADMIN |
| DELETE | `/api/admin/visitors/blacklist/:id` | Remove from blacklist | SOCIETY_ADMIN |
| GET | `/api/admin/visitors/blacklist` | List blacklisted visitors | SOCIETY_ADMIN, GUARD |

### QR Token
- Generated server-side using `crypto.randomUUID()` or `nanoid`
- Stored in `Visitor.qrToken` with validity window (`validFrom`, `validUntil`)
- On scan: check token exists + status PENDING + within validity window → auto-approve + emit Socket.io event to resident
- Blacklist check on every scan attempt; if blacklisted → deny + alert security room Socket event

---

## 8. Events Management

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | List upcoming events | Auth |
| GET | `/api/events/:id` | Event detail + RSVP count | Auth |
| POST | `/api/events/:id/rsvp` | RSVP with headcount | RESIDENT |
| DELETE | `/api/events/:id/rsvp` | Cancel RSVP | RESIDENT |
| POST | `/api/events/:id/photos` | Upload post-event photos | RESIDENT |
| GET | `/api/events/:id/photos` | Get event photo album | Auth |
| POST | `/api/admin/events` | Create event | SOCIETY_ADMIN, DEPT_HEAD |
| PATCH | `/api/admin/events/:id` | Edit event | SOCIETY_ADMIN, DEPT_HEAD |
| DELETE | `/api/admin/events/:id` | Cancel/delete event | SOCIETY_ADMIN |
| GET | `/api/admin/events/:id/attendees` | RSVP attendee list with headcounts | SOCIETY_ADMIN, DEPT_HEAD |
| POST | `/api/admin/events/:id/expenses` | Log event expense with receipt | SOCIETY_ADMIN |

---

## 9. Community Forum

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/forum/threads` | List threads (filterable by category) | Auth |
| POST | `/api/forum/threads` | Create new thread | RESIDENT |
| GET | `/api/forum/threads/:id` | Thread detail with replies | Auth |
| POST | `/api/forum/threads/:id/replies` | Add reply | RESIDENT |
| POST | `/api/forum/threads/:id/polls` | Add poll to thread | RESIDENT |
| POST | `/api/forum/polls/:id/vote` | Vote in poll | RESIDENT |
| POST | `/api/forum/threads/:id/flag` | Flag inappropriate content | Auth |
| POST | `/api/forum/replies/:id/flag` | Flag reply | Auth |
| DELETE | `/api/admin/forum/threads/:id` | Admin remove thread | SOCIETY_ADMIN |
| DELETE | `/api/admin/forum/replies/:id` | Admin remove reply | SOCIETY_ADMIN |
| GET | `/api/admin/forum/flagged` | List flagged content for moderation | SOCIETY_ADMIN |

---

## 10. Marketplace

> 🔮 *Post-MVP* — deferred until the core service/booking/visitor loop is live. See `Project Description.md` → Future Extensions.

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/marketplace/listings` | Browse listings (category, search, price filter) | Auth |
| GET | `/api/marketplace/listings/:id` | Listing detail with seller profile | Auth |
| POST | `/api/marketplace/listings` | Create listing | RESIDENT |
| PATCH | `/api/marketplace/listings/:id` | Edit my listing | RESIDENT |
| DELETE | `/api/marketplace/listings/:id` | Remove my listing | RESIDENT |
| POST | `/api/marketplace/listings/:id/contact` | In-app contact request to seller | RESIDENT |
| POST | `/api/marketplace/listings/:id/rate` | Rate transaction | RESIDENT |
| GET | `/api/admin/marketplace/listings` | All listings including pending approval | SOCIETY_ADMIN |
| PATCH | `/api/admin/marketplace/listings/:id/approve` | Approve listing | SOCIETY_ADMIN |
| PATCH | `/api/admin/marketplace/listings/:id/reject` | Reject with reason | SOCIETY_ADMIN |
| GET | `/api/marketplace/bulk-orders` | Active bulk order groups | Auth |
| POST | `/api/marketplace/bulk-orders` | Start a bulk order group | RESIDENT |
| POST | `/api/marketplace/bulk-orders/:id/join` | Join bulk order | RESIDENT |

---

## 11. Payments & Billing

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/payments/dues` | My current dues breakdown | RESIDENT |
| GET | `/api/payments/history` | Full payment history + ledger | RESIDENT |
| GET | `/api/payments/invoices/:id` | Download invoice PDF | RESIDENT |
| POST | `/api/payments/initiate` | Initiate Razorpay payment order | RESIDENT |
| POST | `/api/payments/verify` | Verify Razorpay signature after payment | RESIDENT |
| POST | `/api/payments/webhook` | Razorpay webhook (payment.captured, payment.failed, refund.processed) | Public (signature-verified) |
| POST | `/api/payments/auto-debit/setup` | Set up Razorpay recurring mandate | RESIDENT |
| DELETE | `/api/payments/auto-debit` | Cancel auto-debit mandate | RESIDENT |
| GET | `/api/admin/billing/config` | Get billing config (per unit type rates, levies) | SOCIETY_ADMIN |
| PATCH | `/api/admin/billing/config` | Update billing config | SOCIETY_ADMIN |
| POST | `/api/admin/billing/generate` | Manually trigger invoice generation cycle | SOCIETY_ADMIN |
| GET | `/api/admin/billing/summary` | Monthly collection summary | SOCIETY_ADMIN |
| GET | `/api/admin/billing/defaulters` | List overdue residents | SOCIETY_ADMIN |
| POST | `/api/admin/expenses` | Log society expense with receipt | SOCIETY_ADMIN |
| GET | `/api/admin/expenses` | Expense log with category breakdown | SOCIETY_ADMIN |

### Razorpay Webhook
- Endpoint: `POST /api/payments/webhook`
- Validate `x-razorpay-signature` header using HMAC SHA256 with webhook secret
- On `payment.captured`: update `Payment.status = PAID`, generate invoice PDF via BullMQ job, send receipt
- On `payment.failed`: update `Payment.status = FAILED`, push notification to resident
- On `refund.processed`: update `Payment.status = REFUNDED`

---

## 12. Notifications

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | My notification inbox (paginated) | Auth |
| PATCH | `/api/notifications/:id/read` | Mark single notification as read | Auth |
| PATCH | `/api/notifications/read-all` | Mark all as read | Auth |
| DELETE | `/api/notifications/:id` | Delete notification | Auth |
| POST | `/api/notifications/device-token` | Register FCM device token | Auth |
| DELETE | `/api/notifications/device-token` | Remove device token on logout | Auth |
| GET | `/api/notifications/preferences` | Get notification preferences | Auth |
| PATCH | `/api/notifications/preferences` | Update preferences (per category on/off) | Auth |

### Notification Categories & Triggers
All notification sends are queued via BullMQ `notifications` queue — never blocking main API thread.

> **MVP note:** Only in-app inbox + email sends are wired for MVP. FCM push, SMS, and WhatsApp Business API delivery are 🔮 *Post-MVP* — there's no mobile app yet to receive push, and SMS/WhatsApp cost money per message.

| Category | Trigger |
|----------|---------|
| Service Updates | Booking confirmed, worker assigned, en-route, completed, rescheduled |
| Visitor Alerts | New walk-in approval request, pre-approved entry logged |
| Grievance Updates | Ticket created, status change, resolved |
| Community | New event published, RSVP reminder 24h before |
| Payments | Due reminder (7d, 3d, due date, overdue), receipt generated |
| Security | Blacklisted entry attempt, package arrived |
| Emergency | SOS triggered, society-wide broadcast |
| AI Insights | 🔮 *Post-MVP:* Preventive maintenance suggestions |

---

## 13. Announcements & Documents

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/announcements` | List announcements (latest first) | Auth |
| GET | `/api/announcements/:id` | View announcement detail | Auth |
| POST | `/api/announcements/:id/read-receipt` | Mark as read (for critical circulars) | Auth |
| POST | `/api/admin/announcements` | Create announcement (rich-text + attachments + audience targeting + schedule) | SOCIETY_ADMIN |
| PATCH | `/api/admin/announcements/:id` | Edit announcement | SOCIETY_ADMIN |
| DELETE | `/api/admin/announcements/:id` | Delete announcement | SOCIETY_ADMIN |
| GET | `/api/admin/announcements/:id/read-receipts` | View read receipts for critical circular | SOCIETY_ADMIN |
| GET | `/api/documents` | List published society documents | Auth |
| GET | `/api/documents/:id/download` | Download document (generates signed S3 URL) | Auth |
| POST | `/api/admin/documents` | Upload document (bye-laws, minutes, forms) | SOCIETY_ADMIN |
| DELETE | `/api/admin/documents/:id` | Remove document | SOCIETY_ADMIN |

---

## 14. Emergency & SOS

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/emergency/sos` | Resident triggers SOS — broadcasts GPS to security + nearby opt-ins | RESIDENT |
| POST | `/api/emergency/security-sos` | Guard triggers SOS — alerts all admins | GUARD |
| POST | `/api/admin/emergency/broadcast` | Society-wide emergency broadcast (fire, flood, power) | SOCIETY_ADMIN |
| POST | `/api/admin/emergency/evacuation` | Start evacuation drill | SOCIETY_ADMIN |
| PATCH | `/api/admin/emergency/evacuation/:id/units` | Mark units as safe/unaccounted | SOCIETY_ADMIN |
| GET | `/api/admin/emergency/evacuation/:id` | Evacuation status tracker | SOCIETY_ADMIN |

### SOS Flow
1. `POST /api/emergency/sos` receives resident GPS coordinates
2. API emits Socket.io event `sos:triggered` to security room and opted-in residents within radius
3. BullMQ job sends SMS to security desk phone number immediately
4. SOS event logged to audit table with timestamp + coordinates

---

## 15. AI Microservice (FastAPI)

> 🔮 *Post-MVP — deferred for MVP.* Auto-assign scoring and reputation scoring (the two things this section is actually used for right now) are implemented as plain TypeScript functions directly in `bookings.service.ts` / `workers.service.ts`, using the exact formulas documented here — no HTTP call, no separate service, no Python runtime. `/ai/maintenance-prediction` and `/ai/sentiment-analysis` need real historical data to be worth building and are deferred along with the rest of this section.

Lives at `services/ai-engine/` in the monorepo. Runs as a separate Python service on port 8001. The Node API calls it internally via HTTP — never exposed to the public internet.

### Endpoints (FastAPI — Internal Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/maintenance-prediction` | Predict maintenance needs per unit/category |
| POST | `/ai/worker-score` | Recalculate composite reputation score |
| POST | `/ai/demand-forecast` | Forecast peak service request periods |
| POST | `/ai/sentiment-analysis` | Analyse grievance text for sentiment + themes |
| POST | `/ai/auto-assign` | Score and rank workers for a booking request |
| GET | `/ai/health` | Health check |

### Node API → AI Microservice Integration
```typescript
// Called from bookings service when auto-assign is needed
const aiResponse = await fetch(`${AI_SERVICE_URL}/ai/auto-assign`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.AI_SERVICE_KEY },
  body: JSON.stringify({ serviceId, scheduledAt, societyId })
});
```

---

## 16. Admin Analytics & Reports

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/analytics/dashboard` | Summary cards: open requests, dues collected, visitors today, grievance count | SOCIETY_ADMIN |
| GET | `/api/admin/analytics/operations` | Service request volume, SLA compliance, worker utilisation | SOCIETY_ADMIN |
| GET | `/api/admin/analytics/financial` | Collection rate, defaulters, expense vs income, P&L | SOCIETY_ADMIN |
| GET | `/api/admin/analytics/community` | Event attendance, forum activity, app adoption | SOCIETY_ADMIN |
| GET | `/api/admin/analytics/security` | Visitor volume, peak times, denied entries | SOCIETY_ADMIN |
| GET | `/api/admin/analytics/satisfaction` | Resident ratings, NPS, grievance resolution satisfaction | SOCIETY_ADMIN |
| GET | `/api/admin/analytics/ai-insights` | Predictive maintenance alerts, worker outliers | SOCIETY_ADMIN |
| GET | `/api/admin/reports/operations` | Exportable operations report (PDF/CSV) | SOCIETY_ADMIN |
| GET | `/api/admin/reports/financial` | Exportable financial report | SOCIETY_ADMIN |
| GET | `/api/admin/reports/visitors` | Visitor log export (CSV) | SOCIETY_ADMIN |

---

## 17. Real-Time (Socket.io)

### Socket Rooms
```
society:{societyId}              — all connected society users
resident:{userId}                — individual resident
security:{societyId}             — all guards + admins
admin:{societyId}                — all admins
worker:{workerId}                — specific worker app
```

### Events Emitted by Server

| Event | Room | Payload | Trigger |
|-------|------|---------|---------|
| `visitor:approval-request` | `resident:{userId}` | visitor object + photo URL | Walk-in logged by guard |
| `visitor:entry-logged` | `resident:{userId}` | visitor entry timestamp | QR scan approved |
| `booking:status-changed` | `resident:{userId}` | booking status + worker ETA | Booking status update |
| `booking:worker-assigned` | `resident:{userId}` | worker profile | Auto/manual assignment |
| `worker:location-update` | `resident:{userId}` | lat/lng | Worker sends GPS on en-route |
| `grievance:status-changed` | `resident:{userId}` | ticket status | Admin updates grievance |
| `notification:new` | `resident:{userId}` | notification object | Any notification created |
| `sos:triggered` | `security:{societyId}` | user + GPS | SOS button pressed |
| `emergency:broadcast` | `society:{societyId}` | message + type | Admin sends emergency alert |
| `payment:received` | `resident:{userId}` | amount + receipt | Razorpay webhook confirms |

---

## 18. Background Jobs (BullMQ)

All queues backed by Redis. Workers run in separate process from API.

| Queue | Jobs | Trigger |
|-------|------|---------|
| `notifications` | sendPushNotification, sendSMS, sendEmail, sendWhatsApp | Any notification event |
| `billing` | generateMonthlyInvoices, sendDueReminder, calculatePenalty | Cron (1st of month), Razorpay webhook |
| `bookings` | autoAssignWorker, slaEscalation, sendPostServiceRating | Booking created, SLA deadline |
| `grievances` | slaEscalation, autoEscalateToAdmin | Grievance SLA deadline |
| `ai` | recalculateWorkerScore, runMaintenancePrediction, sentimentBatch | Rating submitted, nightly cron |
| `media` | virusScan, generateThumbnail, cleanupTempFiles | File upload |
| `reports` | generatePdfReport, generateExcelReport | Admin requests export |
| `announcements` | publishScheduledAnnouncement, sendAnnouncementBlast | Scheduled publish time |
| `dataRetention` | archiveVisitorLogs, purgeExpiredMedia, anonymiseGrievances | Nightly cron |

---

## 19. Security & Middleware

> **MVP note (2026-09-06):** `rateLimiter` (Redis-backed, reusing the OTP module's existing INCR/EXPIRE pattern — no new dependency) and `auditLogger` (structured Winston logs for admin mutating actions, not a DB table — matches this project's "Winston-only for MVP" observability trim used elsewhere) are both real and mounted globally in `app.ts`, ahead of `apiRouter`. Unlike the pseudocode below, `requireAuth`/`injectSocietyId`/`requireRole` are **not** mounted globally — each module's own `*.routes.ts` calls them itself, so public endpoints (login, send-otp, validate-code, the Razorpay webhook) simply don't include them rather than needing an exclusion list. `requestLogger` (a general per-request access log) doesn't exist — only errors and audited mutations are logged; add if request-level tracing is ever needed.

### Middleware Stack (in order)
```typescript
app.use(helmet())                      // HTTP security headers
app.use(cors(corsOptions))             // Whitelist frontend origins
app.use(express.json({ limit: '10mb' }))
app.use(rateLimiter)                   // Redis-backed: 100/min resident, 500/min admin
app.use(requestLogger)                 // Winston logger — structured JSON
app.use(requireAuth)                   // JWT validation on all /api/* except public routes
app.use(injectSocietyId)              // Appends societyId from JWT to req
app.use(requireFeature(...))          // Per-route feature flag check
app.use(requireRole(...))             // Per-route RBAC check
app.use(auditLogger)                   // Logs all admin mutating actions (POST/PATCH/DELETE)
app.use(errorHandler)                  // Global error handler → standard error response format
```

### Prisma Multi-Tenancy Middleware
```typescript
prisma.$use(async (params, next) => {
  if (params.model && societyBoundModels.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, societyId: req.societyId };
    }
  }
  return next(params);
});
```

### Error Response Format
Every error from the API returns this exact shape — no exceptions:
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CANCEL_WINDOW_CLOSED",
    "message": "Cancellation is not allowed within 4 hours of the scheduled time.",
    "details": {}
  }
}
```

Success responses:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 154 }
}
```

### Audit Log
All admin actions (`POST`, `PATCH`, `DELETE`) on sensitive routes are logged:
```json
{ "actorId": "...", "societyId": "...", "action": "UPDATE_RESIDENT", "model": "User", "recordId": "...", "diff": { "before": {}, "after": {} }, "ip": "...", "timestamp": "..." }
```

---

## 20. AppError Class

All business logic errors thrown as `AppError` instances — caught by global error handler:

```typescript
// utils/AppError.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: object
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Usage in any service:
throw new AppError('WORKER_NOT_AVAILABLE', 'No workers available for this slot.', 409);
throw new AppError('OTP_RATE_LIMITED', 'Too many attempts. Try again in 15 minutes.', 429);
throw new AppError('FEATURE_DISABLED', 'Marketplace is not enabled for your society.', 403);
```

### Full Error Code Reference

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Zod schema failed |
| `UNAUTHENTICATED` | 401 | JWT missing or invalid |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `FORBIDDEN` | 403 | Insufficient role |
| `FEATURE_DISABLED` | 403 | Feature flag off for society |
| `NOT_FOUND` | 404 | Resource not found |
| `SOCIETY_CODE_INVALID` | 400 | Bad society code on register |
| `OTP_INVALID` | 400 | OTP mismatch |
| `OTP_EXPIRED` | 400 | OTP TTL elapsed |
| `OTP_RATE_LIMITED` | 429 | Too many OTP attempts |
| `WORKER_NOT_AVAILABLE` | 409 | No worker for auto-assign |
| `BOOKING_CANCEL_WINDOW_CLOSED` | 409 | < 4h before booking |
| `SLOT_ALREADY_BOOKED` | 409 | Time conflict |
| `PAYMENT_SIGNATURE_INVALID` | 400 | Razorpay HMAC mismatch |
| `BLACKLISTED_VISITOR` | 403 | Visitor on blacklist |
| `RATE_LIMITED` | 429 | Generic rate limit |
| `INTERNAL_ERROR` | 500 | Unhandled — logged to Sentry |

---

## 21. Feature Flag Middleware

```typescript
// middleware/feature.middleware.ts
export const requireFeature = (flag: string) => async (req, res, next) => {
  const society = await societyRepository.findById(req.societyId);
  if (!society.features[flag]) {
    throw new AppError('FEATURE_DISABLED', `${flag} is not enabled for your society.`, 403);
  }
  next();
};

// Usage on a route:
router.get('/marketplace/listings',
  requireAuth,
  requireFeature('FEATURE_MARKETPLACE'),
  requireRole('RESIDENT', 'SOCIETY_ADMIN'),
  marketplaceController.listListings
);
```

---

## Environment Variables

```env
# App
NODE_ENV=production
PORT=3001
FRONTEND_URLS=https://app.beaverr.in,https://admin.beaverr.in

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Storage
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_ENDPOINT=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# SMS / OTP
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# Email
SENDGRID_API_KEY=
FROM_EMAIL=noreply@beaverr.in

# Push Notifications
FCM_SERVER_KEY=

# AI Microservice
AI_SERVICE_URL=http://ai-service:8001
AI_SERVICE_KEY=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Worker KYC
DIGIO_API_KEY=
```

---

*Beaverr Backend — v1.0 | 2025*
