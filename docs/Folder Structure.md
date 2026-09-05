# 🦫 Beaverr — Complete Folder & Repository Structure

> **Monorepo** managed with **Turborepo** + **pnpm workspaces**
> One repo. Four apps. Two services. Shared packages. One command to run everything.

> **MVP note:** Only `resident-web`, `admin-web`, and `services/api` are being scaffolded for MVP. `apps/mobile-app`, `apps/guard-app`, `services/ai-engine`, and `infrastructure/kubernetes` / `infrastructure/terraform` are marked 🔮 *Post-MVP* below — documented as the long-term plan, but not created yet. See `Project Description.md` → MVP Scope (v1).

---

## Top-Level Layout

```
beaverr/
│
├── apps/                          # All frontend applications
│   ├── resident-web/              # Next.js 14 — Resident Web Portal (PWA)
│   ├── admin-web/                 # Next.js 14 — Admin Web Portal (includes MVP "Gate Console" page)
│   ├── mobile-app/                # 🔮 Post-MVP — React Native (Expo) — Resident Mobile App
│   └── guard-app/                 # 🔮 Post-MVP — React Native (Expo) — Guard Sub-App (separate bundle)
│
├── services/                      # Backend services
│   ├── api/                       # Node.js + Express — Main REST API + Socket.io
│   └── ai-engine/                 # 🔮 Post-MVP — Python FastAPI — AI/ML Microservice (MVP uses in-Node rule-based scoring)
│
├── packages/                      # Shared libraries (used by multiple apps)
│   ├── ui/                        # Shared React component library
│   ├── types/                     # Shared TypeScript type definitions
│   ├── api-client/                # Shared Axios + TanStack Query hooks
│   └── config/                    # Shared ESLint + TSConfig configs
│
├── infrastructure/                # All deployment configuration
│   ├── docker/                    # Per-service Dockerfiles
│   ├── kubernetes/                # 🔮 Post-MVP — K8s manifests (production)
│   └── terraform/                 # 🔮 Post-MVP — Cloud infra as code (AWS)
│
├── docs/                          # Developer documentation
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-spec.md
│   └── deployment.md
│
├── scripts/                       # Developer utility scripts
│   ├── seedDatabase.ts
│   ├── createSociety.ts
│   └── generateTestData.ts
│
├── .env.example                   # Master env variable template
├── .gitignore
├── docker-compose.yml             # One-command local dev stack
├── turbo.json                     # Turborepo pipeline config
├── pnpm-workspace.yaml            # pnpm workspace definitions
└── README.md
```

---

## `services/api/` — Node.js Backend

```
services/api/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.ts                 # Zod-validated env variables (fail-fast on bad config)
│   │   ├── database.ts            # Prisma client singleton
│   │   ├── redis.ts               # ioredis client
│   │   └── storage.ts             # AWS S3 / Cloudflare R2 client
│   │
│   ├── modules/                   # Domain modules — each follows the same 6-file pattern
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── societies/             # Society onboarding + department management
│   │   │   ├── societies.controller.ts
│   │   │   ├── societies.service.ts
│   │   │   ├── societies.repository.ts
│   │   │   ├── societies.routes.ts
│   │   │   ├── societies.validator.ts
│   │   │   └── societies.types.ts
│   │   │
│   │   ├── residents/             # Resident + unit management
│   │   │   └── [6 files]
│   │   │
│   │   ├── units/
│   │   │   └── [6 files]
│   │   │
│   │   ├── services/              # Service catalogue
│   │   │   └── [6 files]
│   │   │
│   │   ├── bookings/              # Booking lifecycle + SLA engine
│   │   │   └── [6 files]
│   │   │
│   │   ├── workers/               # Worker profiles + scheduling + reputation
│   │   │   └── [6 files]
│   │   │
│   │   ├── grievances/            # Complaint lifecycle + escalation
│   │   │   └── [6 files]
│   │   │
│   │   ├── visitors/              # Gate management + QR tokens
│   │   │   └── [6 files]
│   │   │
│   │   ├── events/                # Society events + RSVP
│   │   │   └── [6 files]
│   │   │
│   │   ├── forum/                 # Community forum + moderation
│   │   │   └── [6 files]
│   │   │
│   │   ├── marketplace/           # Community economy listings
│   │   │   └── [6 files]
│   │   │
│   │   ├── payments/              # Razorpay integration + invoicing
│   │   │   └── [6 files]
│   │   │
│   │   ├── notifications/         # Notification inbox + preferences + FCM
│   │   │   └── [6 files]
│   │   │
│   │   ├── announcements/         # Circulars + read receipts
│   │   │   └── [6 files]
│   │   │
│   │   ├── documents/             # Society document storage
│   │   │   └── [6 files]
│   │   │
│   │   ├── emergency/             # SOS + evacuation tracker
│   │   │   └── [6 files]
│   │   │
│   │   └── analytics/             # Admin dashboards + report exports
│   │       └── [6 files]
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT validation
│   │   ├── rbac.middleware.ts     # Role-based access control
│   │   ├── tenancy.middleware.ts  # Inject societyId from JWT into req
│   │   ├── rateLimit.middleware.ts# Redis-backed rate limiter
│   │   ├── upload.middleware.ts   # Multer config (MIME + size limits)
│   │   ├── audit.middleware.ts    # Log all admin mutating actions
│   │   └── error.middleware.ts    # Global error handler
│   │
│   ├── jobs/                      # BullMQ queue definitions + processors
│   │   ├── queues.ts              # All queue instances in one place
│   │   ├── notification.job.ts    # Push / SMS / Email / WhatsApp sends
│   │   ├── billing.job.ts         # Invoice generation + due reminders
│   │   ├── booking.job.ts         # Auto-assign + SLA escalation
│   │   ├── grievance.job.ts       # Grievance SLA escalation
│   │   ├── ai.job.ts              # Worker score recalc + prediction batch
│   │   ├── media.job.ts           # Virus scan + thumbnail generation
│   │   ├── report.job.ts          # PDF / Excel report generation
│   │   └── announcement.job.ts    # Scheduled announcement publish
│   │
│   ├── sockets/                   # Socket.io event handlers (server-side)
│   │   ├── index.ts               # Attach to HTTP server + auth middleware
│   │   ├── visitor.socket.ts      # Visitor approval / entry events
│   │   ├── booking.socket.ts      # Booking status + worker GPS
│   │   ├── emergency.socket.ts    # SOS + broadcast events
│   │   └── notification.socket.ts # General notification push
│   │
│   ├── routes/
│   │   └── index.ts               # Mounts all module routers with prefix
│   │
│   ├── utils/
│   │   ├── logger.ts              # Winston logger (file + console)
│   │   ├── helpers.ts             # General purpose helpers
│   │   ├── otp.ts                 # OTP generation + Redis storage
│   │   └── pagination.ts          # Cursor/offset pagination helpers
│   │
│   ├── app.ts                     # Express app setup, middleware chain
│   └── server.ts                  # HTTP server + Socket.io bind + BullMQ start
│
├── prisma/
│   ├── schema.prisma              # Full Prisma schema with RLS comments
│   ├── migrations/                # All migration files (versioned)
│   └── seed.ts                    # Demo society seed data
│
├── tests/
│   ├── unit/                      # Unit tests per module
│   ├── integration/               # API integration tests (supertest)
│   └── e2e/                       # End-to-end API tests
│
├── .env.example
├── package.json
└── tsconfig.json
```

### Module 6-File Pattern (Consistent Across All 17 Modules)

```
modules/bookings/
├── booking.controller.ts    # Parses req/res, calls service, returns HTTP response
├── booking.service.ts       # Business logic: SLA calc, auto-assign trigger, state machine
├── booking.repository.ts    # All Prisma queries — zero business logic here
├── booking.routes.ts        # Route definitions: method + path + middleware per endpoint
├── booking.validator.ts     # Zod schemas: createBookingSchema, updateBookingSchema, etc.
└── booking.types.ts         # TypeScript interfaces: Booking, BookingStatus, BookingFilters
```

---

## `services/ai-engine/` — Python FastAPI Microservice 🔮 *Post-MVP*

> Not scaffolded for MVP. Auto-assign scoring and reputation score live directly in `services/api/src/modules/bookings` and `.../workers` as plain TypeScript for now.

```
services/ai-engine/
│
├── app/
│   ├── models/
│   │   ├── maintenance_predictor.py   # Time-series model for failure prediction
│   │   └── worker_scoring.py          # Reputation composite score calculator
│   │
│   ├── routes/
│   │   └── prediction.py              # FastAPI route definitions
│   │
│   ├── services/
│   │   └── data_processor.py          # Feature engineering + data prep
│   │
│   └── main.py                        # FastAPI app entry point
│
├── requirements.txt
└── Dockerfile
```

---

## `apps/resident-web/` — Next.js 14 Resident Portal

```
apps/resident-web/
│
├── app/
│   ├── (auth)/                        # Unauthenticated layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── otp/page.tsx
│   │
│   └── (resident)/                    # Authenticated layout with sidebar + nav
│       ├── layout.tsx                 # Sidebar, TopNav, Socket.io provider
│       ├── dashboard/page.tsx
│       ├── services/
│       │   ├── page.tsx               # Catalogue with search + filters
│       │   └── [id]/
│       │       ├── page.tsx           # Service detail + worker list
│       │       └── book/page.tsx      # Booking form + slot picker
│       ├── bookings/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx          # Detail + live tracking map
│       ├── grievances/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── visitors/
│       │   ├── page.tsx
│       │   ├── pre-approve/page.tsx
│       │   └── whitelist/page.tsx
│       ├── events/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── forum/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── marketplace/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   ├── my-listings/page.tsx
│       │   └── [id]/page.tsx
│       ├── payments/
│       │   ├── page.tsx
│       │   ├── checkout/page.tsx
│       │   ├── invoices/page.tsx
│       │   └── auto-debit/page.tsx
│       ├── notifications/
│       │   ├── page.tsx
│       │   └── preferences/page.tsx
│       ├── announcements/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── documents/page.tsx
│       └── directory/page.tsx
│
├── components/
│   ├── ui/                            # shadcn/ui overrides + custom atoms
│   ├── layout/                        # Sidebar, TopNav, MobileNav, Footer
│   ├── dashboard/                     # Dashboard-specific components
│   ├── services/                      # ServiceCard, WorkerCard, TimeSlotPicker
│   ├── bookings/                      # BookingTimeline, LiveTrackingMap
│   ├── visitors/                      # ApprovalRequestCard, QRPreview
│   ├── payments/                      # DuesSummaryCard, RazorpayButton
│   └── shared/                        # Components used in multiple features
│
├── hooks/                             # Custom React hooks
│   ├── useSocket.ts                   # Socket.io connection hook
│   ├── useAuth.ts
│   ├── useGeolocation.ts
│   └── useNotifications.ts
│
├── lib/
│   ├── api.ts                         # Axios instance with interceptors
│   └── auth.ts                        # Token helpers
│
├── store/                             # Zustand stores
│   ├── authStore.ts
│   ├── notificationStore.ts
│   ├── visitorStore.ts
│   ├── socketStore.ts
│   └── emergencyStore.ts
│
├── utils/
│   ├── formatters.ts                  # Currency, date, phone formatters
│   └── validators.ts
│
├── styles/
│   └── globals.css                    # Tailwind base + CSS variables
│
├── public/
│   ├── manifest.json                  # PWA manifest
│   └── icons/
│
├── middleware.ts                      # Next.js route protection
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## `apps/admin-web/` — Next.js 14 Admin Portal

```
apps/admin-web/
│
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── otp/page.tsx
│   │
│   └── (admin)/                       # Dark-themed admin layout
│       ├── layout.tsx                 # Admin sidebar + topbar
│       ├── dashboard/page.tsx
│       ├── residents/
│       │   ├── page.tsx               # TanStack Table + bulk import
│       │   └── [id]/page.tsx          # Resident profile
│       ├── units/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── services/page.tsx
│       ├── workers/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx          # Performance dashboard + schedule
│       ├── bookings/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── grievances/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── visitors/page.tsx
│       ├── gate/                      # MVP stand-in for guard-app — GUARD role only
│       │   ├── page.tsx               # Today's visitor log + actions
│       │   ├── scan/page.tsx          # QR scan (browser camera or manual token entry)
│       │   └── walkin/page.tsx        # Log walk-in visitor
│       ├── events/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── billing/
│       │   ├── page.tsx               # Config + invoice management
│       │   ├── summary/page.tsx
│       │   └── expenses/page.tsx
│       ├── marketplace/page.tsx
│       ├── announcements/
│       │   ├── page.tsx
│       │   └── new/page.tsx
│       ├── documents/page.tsx
│       ├── forum/page.tsx             # Moderation view
│       ├── analytics/
│       │   ├── page.tsx
│       │   ├── operations/page.tsx
│       │   ├── financial/page.tsx
│       │   ├── community/page.tsx
│       │   ├── security/page.tsx
│       │   └── ai-insights/page.tsx
│       └── settings/
│           ├── page.tsx
│           ├── departments/page.tsx
│           ├── integrations/page.tsx
│           └── audit-log/page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── [feature]/                     # Feature-specific admin components
│
├── charts/                            # Recharts + D3 chart components
│   ├── AreaChart.tsx
│   ├── BarChart.tsx
│   ├── PieChart.tsx
│   ├── HeatmapChart.tsx
│   └── GaugeChart.tsx
│
├── hooks/
├── store/
├── lib/
├── middleware.ts
├── next.config.js
└── tailwind.config.ts
```

---

## `apps/mobile-app/` — Expo Resident App 🔮 *Post-MVP*

> Not scaffolded for MVP — deferred until `resident-web` + `services/api` are proven.

```
apps/mobile-app/
│
├── app/                               # Expo Router file-based routing
│   ├── _layout.tsx                    # Root layout with providers
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── otp.tsx
│   └── (tabs)/                        # Bottom tab navigator
│       ├── _layout.tsx                # Tab bar definition
│       ├── index.tsx                  # Dashboard
│       ├── services.tsx
│       ├── visitors.tsx
│       ├── payments.tsx
│       └── more.tsx
│
├── screens/                           # Full screens navigated to from tabs
│   ├── ServiceDetailScreen.tsx
│   ├── BookingDetailScreen.tsx
│   ├── NewGrievanceScreen.tsx
│   ├── GrievanceDetailScreen.tsx
│   ├── PreApproveVisitorScreen.tsx
│   ├── MarketplaceDetailScreen.tsx
│   └── EmergencySOSScreen.tsx
│
├── components/
│   ├── ui/                            # Mobile-specific atoms
│   ├── BookingCard.tsx
│   ├── ServiceCard.tsx
│   ├── VisitorApprovalCard.tsx
│   └── SOSButton.tsx
│
├── navigation/                        # Deep link config + tab definitions
│   └── linking.ts
│
├── api/                               # Axios instance + React Query hooks (mobile)
│   ├── client.ts
│   └── hooks/
│
├── store/                             # Zustand stores (mobile)
│
├── utils/
│
├── app.json                           # Expo config
├── app.config.ts                      # Dynamic config (env vars)
├── babel.config.js
└── tsconfig.json
```

---

## `apps/guard-app/` — Expo Guard Sub-App 🔮 *Post-MVP*

> Not scaffolded for MVP. The `visitors` API is the same either way — MVP exposes it through a "Gate Console" page in `admin-web` (`(admin)/gate/page.tsx`, `GUARD` role) instead of a dedicated app.

```
apps/guard-app/
│
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   └── login.tsx                  # Guard credentials only
│   └── (gate)/
│       ├── _layout.tsx
│       ├── index.tsx                  # Today's visitor log + action buttons
│       ├── scan.tsx                   # Full-screen Expo Barcode Scanner
│       └── walkin.tsx                 # Walk-in form: camera + details
│
├── components/
│   ├── VisitorLogCard.tsx
│   ├── ScanResultModal.tsx            # Shows visitor info after QR scan
│   └── BlacklistAlertScreen.tsx       # Full-screen red alert on blacklist hit
│
├── navigation/
├── api/
├── store/
│
├── app.json                           # Separate bundle ID from mobile-app
├── app.config.ts
└── tsconfig.json
```

---

## `packages/` — Shared Libraries

> **Repo reality check:** the actual repo has `eslint-config/` and `typescript-config/` as top-level packages (not nested under a `config/` package as shown below), and `types/` and `ui/` currently only contain the create-turbo starter stubs. `api-client/` doesn't exist yet — create it in MVP Phase 1 when wiring up `resident-web`/`admin-web`.

```
packages/
│
├── ui/                                # Shared React components (web portals)
│   ├── src/
│   │   ├── StatusChip.tsx
│   │   ├── RepScoreBar.tsx
│   │   ├── StarRating.tsx
│   │   ├── Avatar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── PageHeader.tsx
│   │   ├── DataTable.tsx
│   │   ├── FileUploadZone.tsx
│   │   └── index.ts
│   └── package.json
│
├── types/                             # TypeScript interfaces used everywhere
│   ├── src/
│   │   ├── user.types.ts
│   │   ├── society.types.ts
│   │   ├── service.types.ts
│   │   ├── booking.types.ts
│   │   ├── worker.types.ts
│   │   ├── grievance.types.ts
│   │   ├── visitor.types.ts
│   │   ├── payment.types.ts
│   │   └── index.ts
│   └── package.json
│
├── api-client/                        # Shared API hooks
│   ├── src/
│   │   ├── client.ts                  # Base Axios instance
│   │   └── hooks/                     # TanStack Query hooks
│   └── package.json
│
└── config/                            # Tooling shared configs
    ├── eslint-config/
    │   ├── index.js                   # Base ESLint config
    │   └── package.json
    └── tsconfig/
        ├── base.json
        ├── nextjs.json
        └── react-native.json
```

---

## `infrastructure/` — Deployment Config

> For MVP, only `infrastructure/docker/` (per-service Dockerfiles) is needed — deploy targets are Vercel + Render/Railway + Supabase free tiers, no Kubernetes/Terraform. The `kubernetes/` and `terraform/` subfolders below are 🔮 *Post-MVP*.

```
infrastructure/
│
├── docker/
│   ├── api.Dockerfile
│   ├── ai-engine.Dockerfile
│   ├── resident-web.Dockerfile
│   └── admin-web.Dockerfile
│
├── kubernetes/
│   ├── api-deployment.yaml
│   ├── api-service.yaml
│   ├── ai-engine-deployment.yaml
│   ├── redis.yaml
│   ├── postgres.yaml
│   ├── meilisearch.yaml
│   └── nginx-ingress.yaml
│
└── terraform/
    ├── main.tf                        # AWS EKS, RDS, S3, CloudFront
    └── variables.tf
```

---

## Root Config Files

### `docker-compose.yml` (local dev — one command startup)

```yaml
services:
  postgres:     # PostgreSQL 16
  redis:        # Redis 7
  api:          # Node.js API (hot reload via ts-node-dev)
  resident-web: # Next.js resident portal (hot reload)
  admin-web:    # Next.js admin portal (hot reload)
  # 🔮 Post-MVP: meilisearch, ai-engine (Python FastAPI, uvicorn --reload)
```

### `turbo.json` (build pipeline)

```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": { "dependsOn": ["^build"] }
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
```

### `.env.example` (master template)

```env
# ── App ──────────────────────────────────────────────
NODE_ENV=development
API_PORT=3001

# ── Database ─────────────────────────────────────────
DATABASE_URL=postgresql://beaverr:beaverr@localhost:5432/beaverr

# ── Redis ────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── JWT ──────────────────────────────────────────────
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Storage (AWS S3 or Cloudflare R2) ────────────────
S3_BUCKET=beaverr-media
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_ENDPOINT=

# ── Payments ─────────────────────────────────────────
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# ── SMS / OTP ────────────────────────────────────────
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# ── Email ────────────────────────────────────────────
SENDGRID_API_KEY=
FROM_EMAIL=noreply@beaverr.in

# ── Push Notifications ───────────────────────────────
FCM_SERVER_KEY=

# ── Search ───────────────────────────────────────────
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=

# ── Google Maps ──────────────────────────────────────
GOOGLE_MAPS_API_KEY=

# ── Worker KYC ───────────────────────────────────────
DIGIO_API_KEY=

# ── AI Microservice ──────────────────────────────────
AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_KEY=your_internal_key

# ── Resident Web (NEXT_PUBLIC_*) ──────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
NEXT_PUBLIC_MEILISEARCH_HOST=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_KEY=
```

---

## Build & Development Commands

```bash
# ── Clone & Install ───────────────────────────────────
git clone https://github.com/yourname/beaverr.git
cd beaverr
pnpm install

# ── Start entire local dev stack ─────────────────────
docker compose up                  # Starts: Postgres, Redis
pnpm dev                           # Turborepo: starts all apps + services in parallel

# ── Individual service dev ───────────────────────────
pnpm --filter api dev              # API only
pnpm --filter resident-web dev     # Resident web only
pnpm --filter admin-web dev        # Admin web only
pnpm --filter mobile-app start     # 🔮 Post-MVP — Expo resident mobile
pnpm --filter guard-app start      # 🔮 Post-MVP — Expo guard app

# ── Database ─────────────────────────────────────────
pnpm --filter api prisma:migrate   # Run DB migrations
pnpm --filter api prisma:seed      # Seed demo society data
pnpm --filter api prisma:studio    # Open Prisma Studio UI

# ── Build ────────────────────────────────────────────
pnpm build                         # Build all apps (Turborepo cached)

# ── Tests ────────────────────────────────────────────
pnpm test                          # Run all tests
pnpm --filter api test:unit
pnpm --filter api test:integration
```

---

## Build Order (Turborepo Dependency Graph)

```
packages/config   ──►  (all apps and services)
packages/types    ──►  packages/api-client  ──►  apps/*
                  ──►  services/api
packages/ui       ──►  apps/resident-web
                  ──►  apps/admin-web
```

---

*Beaverr Folder Structure — v1.0 | 2025*
