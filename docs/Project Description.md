# 🦫 Beaverr
## *Where Houses Become Homes*

> **Residential Society Management ERP**
> A full-stack society & residential community management platform — portfolio project by a software developer.

---

## Table of Contents

1. [[#Executive Summary]]
2. [[#MVP Scope (v1)]]
3. [[#The Problem We Solve]]
4. [[#Competitive Landscape]]
5. [[#Where Beaverr Differentiates]]
6. [[#Product Overview]]
7. [[#Resident Interface — Features]]
8. [[#Admin Interface — Features]]
9. [[#AI-Powered & Smart Features]]
10. [[#Community Economy Layer]]
11. [[#Security & Gate Intelligence]]
12. [[#Technology Stack]]
13. [[#System Architecture]]
14. [[#Data Models]]
15. [[#Security & Compliance]]
16. [[#Development Roadmap]]
17. [[#Deployment Strategy]]
18. [[#Non-Functional Requirements]]
19. [[#Core Backend Module Breakdown]]
20. [[#State Machines]]
21. [[#API Design Conventions]]
22. [[#Error Handling Strategy]]
23. [[#Feature Flags]]
24. [[#Data Lifecycle & Retention]]
25. [[#Rate Limiting Policy]]
26. [[#Testing Strategy]]
27. [[#Observability]]
28. [[#Future Extensions]]
29. [[#Risks & Tradeoffs]]
30. [[#Why This Project on a Resume]]
31. [[#Brand Identity]]

---

## Executive Summary

Beaverr is a **smart residential community management platform** that digitises every aspect of living in a housing society — from booking a plumber to approving a visitor at the gate. Just as beavers engineer robust, well-organised habitats, Beaverr empowers societies, residencies, and townships to run with the same precision and warmth.

Residents interact via a **dedicated mobile app** (Android & iOS) and **web portal**. Society admins and staff operate through a **separate admin interface** built for workflow management, reporting, and community oversight. Societies onboard via a unique **6-digit Society Code**, enabling clean multi-tenant data isolation.

Beaverr is not trying to be "another MyGate." It is a **hyperlocal community platform with a service marketplace at its core** — turning passive residents into an interconnected, self-sustaining community economy.

---

## MVP Scope (v1)

> This section is the single source of truth for what's actually being built right now. Everything else in this document (full multi-app architecture, AI microservice, marketplace, etc.) remains the long-term vision and is preserved for reference, but is explicitly **out of scope** until MVP ships. See [[#Future Extensions]] for the full deferred list.

**Platforms:** Web only — `resident-web` + `admin-web` (Next.js). `mobile-app` and `guard-app` (Expo) are deferred until the backend and web UX are proven. Gate/visitor scanning for MVP is handled via a **Gate Console** page inside `admin-web` (behind the `GUARD` role) instead of a dedicated mobile app.

**AI layer:** No separate Python FastAPI microservice for MVP. Auto-assign scoring and worker reputation score are implemented as plain TypeScript formulas directly in the `bookings`/`workers` services — the formulas are already fully specified in this doc and require no ML model to demonstrate the concept.

**MVP module phases:**

| Phase | Scope |
|---|---|
| **Phase 1 — Foundations** | Prisma schema, `docker-compose` (Postgres + Redis), `auth` (JWT + RBAC + tenancy, pluggable OTP), `societies`, `residents`, `units`, real `resident-web`/`admin-web` scaffolding |
| **Phase 2 — Core service loop** | `services` catalogue (Postgres search, no Meilisearch), `bookings` (state machine, SLA engine, rule-based auto-assign), `workers` (profiles, scheduling, reputation score) |
| **Phase 3 — Trust & safety loop** | `grievances` (lifecycle, escalation), `visitors` (QR, walk-in, blacklist via Gate Console), `notifications` (in-app inbox + email only — push/SMS/WhatsApp deferred until a mobile app exists) |
| **Phase 4 — Money & basic reporting** | `payments` (Razorpay test mode, webhooks, invoicing, dues/reminders), `analytics` (admin dashboard + reports straight from Postgres, no TimescaleDB) |
| **Phase 5 — Stretch** (only if time remains) | Events board, announcements, documents, community forum |

**Explicitly deferred to post-MVP** (see [[#Future Extensions]]): Marketplace / Community Economy Layer, real ML-based AI microservice, `mobile-app` + `guard-app` (Expo), Digio/Signzy KYC, WhatsApp Business API, Mixpanel, Kubernetes + Terraform, Meilisearch/TimescaleDB/pgvector, OpenTelemetry tracing, full Prometheus/Grafana/Loki observability stack (MVP uses Winston logging + Sentry only).

---

## The Problem We Solve

Indian housing societies are growing rapidly in scale and complexity, yet most are managed through WhatsApp groups, paper registers at the gate, and manual accounting. Even when digital tools are used, they are fragmented:

- One app for billing, another for complaints, a WhatsApp thread for visitors.
- Workers are sourced from unknown external vendors with no accountability.
- Residents have no visibility into service status, no way to rate workers, and no community forum.
- Societies have no data to make operational decisions.

**Beaverr unifies all of this into a single, trusted platform.**

---

## Competitive Landscape

Understanding the market is critical. Several platforms already operate in this space.

### Major Competitors

| Platform | Scale | Core Strength | Key Gap |
|---|---|---|---|
| **MyGate** | 25,000+ societies, millions of homes | Visitor management, billing, ERP for societies | No internal service marketplace; external vendor model |
| **JioGate** (Reliance) | Growing rapidly | Visitor approvals, security, staff attendance | Primarily a security-focused tool, not full community management |
| **SocietyManagementApp** | Smaller scale | Maintenance billing, amenity booking, notice board | Basic; no worker reputation system or AI features |
| **AppSociety** | Smaller scale | Billing automation, resident-management communication | Communication-focused, limited operational depth |
| **iSociety Manager** | Smaller scale | Visitor logs, maid/staff tracking, security | Narrow scope; security only |

### Community-Focused Platforms (Adjacent)

| Platform | Focus | Gap |
|---|---|---|
| **Simply Local** | Geo-fenced community groups, event broadcasting | No facility management, no service booking |
| **Nyburs** | Neighbourhood social network, events | Social only, no operations layer |

### The Key Insight

> Most platforms treat residents as **passive users** — they approve visitors, pay bills, and raise complaints.
> Beaverr treats residents as **active participants** in a community economy.

None of the major competitors offer:
- A structured **internal service marketplace** with registered, rated workers
- A **community economy layer** (neighbour-to-neighbour services, resale, sharing)
- **AI-powered maintenance prediction** and auto-assignment
- A **worker reputation system** with background verification badges
- **Smart logistics** — parcel lockers, delivery scheduling, moving services

---

## Where Beaverr Differentiates

These are Beaverr's core pillars of originality. Every architecture and feature decision reinforces these.

### 1. Society-Owned Service Marketplace
Rather than pointing residents to Justdial or Urban Company, Beaverr gives every society its own curated marketplace:

```
Society → Registers & vets workers → Lists services with pricing
Resident → Browses → Books → Worker assigned → Service delivered → Resident rates
```

Workers are known to the society. Pricing is transparent. Trust is built over time through the reputation system.

### 2. Worker Reputation System
Every worker has a verifiable public profile:
- Average star rating across all jobs
- Number of completed assignments
- Complaint history (if any)
- Background verification badge
- Skill tags and specialisations

Residents make informed choices. Bad workers surface naturally through data.

### 3. AI Maintenance Prediction
Instead of waiting for things to break, Beaverr learns:
- Booking patterns (e.g., plumbing spikes in monsoon)
- Unit-level complaint history
- Worker performance trends
- Seasonal maintenance cycles

The system proactively suggests: *"Water heaters in Block B have had 3 complaints this winter — schedule a preventive check?"*

### 4. Community Economy Layer
Beaverr enables **hyperlocal, neighbour-to-neighbour commerce**:
- Hire a neighbour as a tutor, musician, yoga instructor, or cook
- Buy/sell/exchange second-hand furniture, appliances, books
- Rent tools, sporting equipment, baby gear
- Share subscriptions or bulk grocery orders

This turns Beaverr from a management app into a **community platform** — something no competitor offers.

### 5. Smart Logistics
- **Parcel locker integration** — resident notified with OTP on delivery
- **Delivery slot scheduling** — resident pre-declares preferred delivery windows
- **Moving service coordination** — lift/loading dock booking for shifting days
- **Bulk order aggregation** — society-level group buying for better pricing

### 6. Emergency Response System
- **SOS panic button** — broadcasts GPS location to security desk + nearby opt-in residents
- **Society-wide emergency broadcast** — fire, gas leak, power outage, medical emergency
- **Evacuation status tracking** — admin marks residents as safe/unaccounted during drills

---

## Product Overview

### Society Onboarding

Each housing society registers on Beaverr and receives a **unique 6-digit Society Code**. Residents use this code during signup to join the correct community.

| Step | Actor | Action |
|---|---|---|
| 1 | Beaverr Admin | Creates society account, issues 6-digit code |
| 2 | Society Admin | Sets up departments, uploads resident list (CSV), configures services |
| 3 | Resident | Downloads app → enters Society Code → OTP verification → account active |
| 4 | Security Guard | Logs into guard sub-app with guard credentials |

**Supported unit naming:** Wing/Block + Floor + Flat number, or villa names/numbers for independent layouts.

---

## Resident Interface — Features

### 3.1 Home Dashboard

The resident home screen is a personalised hub:

- **Upcoming events** carousel (pujas, festivals, AGM)
- **Active service request** status with real-time tracking
- **Pending actions** badge (visitor approvals, grievances needing input)
- **Quick actions:** Book Service · Report Grievance · Approve Visitor · Pay Dues · SOS
- **AI Insight card:** *"Your AC hasn't been serviced in 11 months — book a check-up?"*
- **Emergency contact strip** — security desk, maintenance hotline

---

### 3.2 Service Catalogue & Booking

All services offered by the society are browsable, searchable, and bookable with pricing visibility upfront.

#### 🔧 Maintenance Category

| Sub-Category | Example Services | Default SLA |
|---|---|---|
| Plumbing | Leakage fix, tap replacement, drainage cleaning, water heater repair | Next working day |
| Carpentry | Door/window repairs, furniture assembly, lock fitting, wardrobe work | 1–2 working days |
| Masonry & Civil | Wall crack sealing, tile replacement, plastering, waterproofing | 2–3 working days |
| Electrical | Wiring, MCB replacement, fan/light installation, inverter servicing | Next working day |
| Painting | Interior touch-up, full room painting, wall texture | 2–3 working days |
| HVAC & Appliances | AC servicing, geyser repair, washing machine inspection | 1–2 working days |
| Pest Control | Cockroach/rodent/termite treatment | Scheduled slots |
| Deep Cleaning | Kitchen, bathroom, post-renovation deep clean | Scheduled slots |

#### 🌟 Amenities & Lifestyle Services

| Sub-Category | Example Services | Booking Mode |
|---|---|---|
| Childcare | Daycare nanny, babysitting, after-school supervision | Advance booking |
| Wellness & Beauty | Parlour/spa, haircut, massage (home visit) | Scheduled slots |
| Heavy Labour | Moving assistance, furniture arrangement, packing | Advance booking |
| Gardening | Plant care, balcony garden, lawn trimming, flower delivery | Weekly subscription |
| Driver for Hire | Part-time/on-call vetted driver, car wash & detailing | Same-day or advance |
| Fitness & Wellness | Personal trainer, yoga instructor, dietitian | Scheduled slots |
| Pet Services | Dog walker, pet grooming, vet on-call, pet sitting | Advance booking |
| Tutoring | Home tutor referral, hobby classes (music, art, coding) | Advance booking |
| Home Chef / Tiffin | Daily meal subscription, event catering, trial orders | Subscription or on-demand |
| Senior Citizen Care | Medication reminders, companionship visits, physio at home | Scheduled slots |

#### Booking Flow

```
Browse Category → Select Service → View Worker Profile & Rating
→ Choose Time Slot → Confirm Booking
→ Notification: Confirmed + ETA window
→ Day-of: "Worker en-route" push notification
→ Post-service: Rate worker (1–5 stars + optional comment)
→ Option to reschedule up to 4 hours before appointment
```

---

### 3.3 Community Events Board

A society noticeboard for upcoming events with full RSVP flow.

- **Event types:** Navratri, Diwali puja, Holi, Society parties, Sports tournaments, AGM, Club activities
- RSVP with headcount; add to phone calendar via deep link
- Post-event photo album auto-created
- Push notification on new event publication

---

### 3.4 Grievances & Complaints

Structured issue resolution with full lifecycle tracking.

- **Complaint types:** Against service workers · Against neighbours (noise, parking, pets) · Against society management · Infrastructure (common areas, lifts, parking)
- Each complaint gets a **unique Ticket ID** — tracked through `Open → In Review → Resolved → Closed`
- Photo/video evidence upload
- **Anonymous complaint option** for sensitive neighbour issues
- Auto-escalation if unresolved past SLA
- Resolution summary visible to complainant on closure

---

### 3.5 Visitor & Gate Management

*(Applicable when society has restricted entry — the admin toggles this module on/off)*

#### Pre-Approved Visitors
- Resident sends digital invitation → visitor gets QR code via WhatsApp/SMS
- Gate security scans QR → auto-approved, no resident call needed
- Set validity window (e.g., 2:00 PM – 6:00 PM on a specific date)

#### Walk-In Visitors
```
Security logs visitor (name + photo + vehicle)
→ Resident gets push notification with visitor photo
→ Resident taps Approve / Deny
→ Gate notified instantly
→ Denied entries logged for audit trail
```

#### Frequent Visitors & Domestic Staff
- Whitelist maids, delivery executives, regular guests
- Recurring pass valid for defined period (e.g., Mon–Sat, 8 AM–7 PM)
- Delivery management: resident directed to common drop point or flat

#### Vehicle & Cab Management
- Pre-register expected Ola/Uber; security sees vehicle number in advance
- Visitor parking slot allotment notifications

---

### 3.6 Notifications Centre

Unified inbox, categorized for clarity:

| Category | Examples |
|---|---|
| Service Updates | Booking confirmed, worker en-route (ETA), completed, rescheduled |
| Visitor Alerts | New approval request (with photo), approved/denied confirmation |
| Grievance Updates | Ticket acknowledged, status change, resolution posted |
| Community | New event, reminders, society announcements |
| Payments | Due reminder, receipt, overdue alert |
| Security | Unusual entry attempt, package arrived, vehicle complaint |
| Emergency | Society-wide broadcast — fire drill, power cut, water shutdown |
| AI Insights | Preventive maintenance suggestions, seasonal service reminders |

---

### 3.7 Maintenance Dues & Payments

- View itemized monthly bill (maintenance charges, utility split, special levies)
- Pay via UPI, Net Banking, Debit/Credit Card, or EMI for large dues
- Auto-debit setup for monthly payments
- Download PDF receipts for any period
- Penalties auto-calculated on overdue dues
- Full payment history and ledger accessible anytime

---

### 3.8 Society Directory & Emergency Contacts

- Departments: Maintenance · Admin/HR · Recreational Club · Security · Housekeeping
- Each entry: department, contact person, phone, email, working hours
- **Emergency strip:** 24/7 security desk, ambulance, fire, society emergency line
- Resident-to-resident opt-in directory for community networking

---

### 3.9 Society Documents & Notices

- Society bye-laws, meeting minutes, annual accounts (published by admin)
- Circulars, rule reminders, water-cut/power-cut schedules
- Downloadable forms: NOC request, parking pass, tenant registration

---

### 3.10 Community Forum

- **Category threads:** For Sale/Rent · Lost & Found · Carpool Buddies · Recommendations · General Chat
- Post photos, documents, or polls
- Admin moderation; flag and remove inappropriate content

---

### 3.11 Community Economy (Beaverr Marketplace) 🔮 *Post-MVP*

The feature that sets Beaverr apart from every competitor — deferred until the core service/booking/visitor loop is solid:

- **Neighbour Services:** Hire a resident as a tutor, yoga instructor, musician, cook, or pet-sitter
- **Buy / Sell / Exchange:** Second-hand furniture, appliances, baby gear, books
- **Tool & Equipment Rental:** Drill machines, ladders, sports gear, baby strollers
- **Bulk Order Groups:** Aggregate grocery or household supply orders for better rates
- **Skill Sharing:** Residents offer free skill sessions (language lessons, cooking classes) for community goodwill

All transactions are rated. Profiles build trust over time. Society admin moderates listings.

---

## Admin Interface — Features

### 4.1 Admin Dashboard

- Real-time summary cards: open requests, pending grievances, today's visitors, dues collected vs. outstanding
- Activity feed: latest bookings, new registrations, flagged complaints
- Graphs: monthly request volume, category breakdown, resident satisfaction scores, collection efficiency
- Worker attendance and availability heatmap
- **AI anomaly alerts:** unusual complaint spikes, a worker with declining ratings, overdue invoice clusters

---

### 4.2 Resident & Unit Management

- Register individually or via CSV bulk upload
- Flat/unit master: Wing, Floor, Unit, Owner vs. Tenant status
- Ownership transfer: mark as sold/rented; new occupant auto-invited
- Resident profile: contacts, vehicles, emergency contacts, payment history
- Suspend accounts for rule violations (auto-notifies resident with reason)

---

### 4.3 Service & Worker Management

- Add/edit/remove services: set pricing, description, duration estimate, category
- Worker profiles: name, photo, ID verification status, skills, assignments
- Worker scheduling: availability windows, off days, max concurrent jobs
- **Real-time GPS tracking** during assigned service
- Performance dashboard: ratings, completed jobs, complaints filed against worker
- **Background verification badge** integration

---

### 4.4 Grievance Management

- All complaints in one view with priority tagging: `Low / Medium / High / Critical`
- Assign to department; internal notes system (invisible to resident)
- SLA timer with auto-escalation rules
- Resolution templates for common complaint types
- Monthly analytics: most common issues, average resolution time, repeat offenders

---

### 4.5 Visitor & Gate Admin

- Security guard sub-portal: simplified UI for gate staff
- Visitor log export (CSV — daily/weekly) for physical records
- Blacklist management: auto-denied with security alert
- Delivery partner managed list with bypass rules
- Full entry/exit timestamp + photo evidence log

---

### 4.6 Events Management

- Create/edit/delete events with rich-text description
- RSVP tracking: headcount, attendee list, catering/seating estimates
- Scheduled push notification blasts
- Post-event album with resident-submitted photos
- Society-funded event expense tracking with receipt uploads

---

### 4.7 Billing & Financial Management

- Configure monthly dues per unit type (1BHK/2BHK/3BHK/villa)
- Add special levies: sinking fund, repair fund, festivity fund
- Auto-generate invoices for all units on billing cycle date
- Real-time payment reconciliation with gateway
- Automated reminder sequence: 7 days → 3 days → due date → overdue
- Financial reports: collection summary, defaulter list, expense vs. income
- Expense logging with category tags and receipt attachments

---

### 4.8 AI & Analytics Module

- **Maintenance prediction:** forecast likely failure based on historical patterns
- **Worker performance scoring:** composite score from ratings, SLA compliance, complaint count
- **Demand forecasting:** predict peak service request periods for worker scheduling
- **Revenue analytics:** dues collection trends, defaulter risk scoring, seasonal expense patterns
- **Resident sentiment analysis:** aggregate grievance themes to surface systemic issues

---

### 4.9 Announcements & Circulars

- Rich-text with image/PDF attachments
- Audience targeting: all residents · specific blocks/wings · owners only · tenants only
- Scheduled publishing (set future date/time)
- **Read receipts** for critical circulars

---

### 4.10 Reports & Analytics

| Report Type | Contents |
|---|---|
| Operations | Service requests by category, SLA compliance rate, worker utilisation |
| Financial | Monthly collection, outstanding dues, expense breakdown, P&L summary |
| Community | Event attendance trends, forum activity, app adoption rate |
| Security | Visitor volume, peak entry times, denied entries, blacklist incidents |
| Satisfaction | Resident ratings, NPS score, grievance resolution satisfaction |
| AI Insights | Predictive maintenance alerts, worker performance outliers |

---

## AI-Powered & Smart Features

This is Beaverr's engineering differentiator — the layer that elevates it from a CRUD app to a smart platform.

> **MVP note:** For v1, "AI-Powered" is implemented as deterministic, rule-based TypeScript (the formulas below run as-is, in-process — no ML model, no separate service). The Auto-Assignment Algorithm and Worker Reputation Score are both in MVP scope. The Maintenance Prediction Engine (which genuinely needs historical data + a model) is 🔮 *Post-MVP*.

### AI Maintenance Prediction Engine 🔮 *Post-MVP*

Requires historical booking data and a real model to be meaningful — deferred until there's enough production data to train against.

```
Input Sources:
  - Historical service request data (category, frequency, unit)
  - Seasonal patterns (monsoon = plumbing, winter = heating)
  - Unit age and maintenance gap since last service
  - Worker feedback tags (e.g., "temporary fix", "recurring issue")

Output:
  - Proactive push notification to resident: "Your geyser was last serviced 14 months ago.
    Winter is approaching — book a preventive check?"
  - Admin alert: "6 AC complaints in Block C this month — schedule a building-wide AMC?"
  - Suggested maintenance calendar for the society
```

### Auto-Assignment Algorithm

When a service request is submitted:

```
1. Filter workers by: skill match + availability on requested date
2. Rank by: proximity (if multi-block), rating score, current workload
3. Assign top-ranked available worker
4. Notify worker → worker confirms → resident notified with worker profile
5. If no worker available in SLA window → admin flagged for manual assignment
```

### Worker Reputation System

Each worker has a **composite reputation score (0–100)**:

```
Score = (Avg Rating × 40%) + (SLA Compliance Rate × 35%)
      + (Zero Complaints Bonus × 15%) + (Tenure Bonus × 10%)
```

- Score is visible to residents during booking
- Score determines priority in auto-assignment
- Workers below threshold score enter a performance improvement flag
- Background verification adds a "Verified ✓" badge to profile

---

## Community Economy Layer

> 🔮 *Post-MVP* — deferred until after MVP; see [[#MVP Scope (v1)]].

Beaverr's marketplace turns the society into a **self-sustaining micro-economy** — something no competitor currently provides.

### How It Works

```
Resident lists a service or item
  → Sets category, description, price/rate, availability
  → Society admin approves listing (moderation)
  → Other residents browse and contact
  → Transaction happens in-app or offline (admin's discretion)
  → Both parties rate each other post-transaction
```

### Categories

| Category | Examples |
|---|---|
| Neighbour Services | Tuition, yoga, music lessons, cooking, tailoring, pet-sitting |
| Buy / Sell | Furniture, appliances, books, baby items, electronics |
| Rent & Borrow | Tools, sports equipment, cameras, strollers, camping gear |
| Bulk Orders | Grocery aggregation, water can delivery, LPG cylinder coordination |
| Free Community Events | Skill workshops, recipe sharing, hobby meetups |

> **Note on monetisation:** Society can take a small platform fee (0–2%) on paid transactions, creating a revenue stream that funds platform subscription costs.

---

## Security & Gate Intelligence

### Visitor Management Flow (Full)

```
[Pre-approved] Resident sends invite → Visitor receives QR
               → Gate scans QR → Auto-approved entry logged

[Walk-in]      Security photographs visitor → Logs name + vehicle
               → Resident notified with photo → Approve / Deny
               → Gate notified in real-time

[Domestic Staff] Resident whitelists → Recurring pass issued
                 → Entry auto-logged daily without approval needed

[Blacklisted]  Auto-denied at scanning → Security alerted
               → Incident logged with timestamp
```

### SOS & Emergency Response

- **Resident SOS button:** broadcasts GPS to security + opted-in neighbours within 60 seconds
- **Security SOS button:** alerts all society admins simultaneously
- **Society broadcast:** admin pushes emergency message to all residents (fire, flood, power)
- **Evacuation tracker:** admin marks units as safe/unaccounted during drills

### Smart Parcel & Delivery Management

- Resident sets preferred delivery window in profile
- Delivery executive scanned at gate; resident notified
- Optional smart locker integration: OTP issued to resident upon parcel placement
- Delivery executive auto-whitelisted per resident preference (Swiggy, Amazon, Zomato)

---

## Technology Stack

### Frontend — Resident Web Portal

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/SSG, fast load, SEO-ready |
| Language | TypeScript | Type safety across full codebase |
| UI Library | shadcn/ui + Tailwind CSS | Accessible, composable, design-consistent |
| State Management | Zustand + TanStack Query | Global state + server state caching |
| Real-Time | Socket.io client | Live notifications, visitor approvals, chat |
| Charts | Recharts | Payment history, usage graphs |
| Forms | React Hook Form + Zod | Schema-validated forms |
| Maps | Google Maps JS API | Visitor GPS. 🔮 *Post-MVP: worker live tracking* |
| Payments | Razorpay JS SDK | UPI, card, net banking, EMI |
| PWA | next-pwa | Installable web app for non-mobile users |

### Frontend — Admin Web Portal

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) — separate deployment |
| UI | shadcn/ui + Tailwind CSS with dark admin theme |
| Data Tables | TanStack Table — sortable, filterable, paginated grids |
| Charts & Analytics | Recharts + D3.js — rich dashboards |
| Export | react-pdf / SheetJS — browser-side PDF/Excel generation |
| Calendar | FullCalendar React — event and service scheduling |
| Drag & Drop | dnd-kit — drag-to-assign workers to time slots |

### Mobile Apps 🔮 *Post-MVP*

> Deferred until the backend + web portals are proven. MVP replaces the guard sub-app with a "Gate Console" page inside `admin-web`. Table kept as the long-term plan.

| Layer | Technology | Note |
|---|---|---|
| Framework | React Native (Expo managed) | Single codebase → Android + iOS |
| Navigation | Expo Router | File-based routing |
| Push Notifications | Expo Notifications + Firebase FCM | All alert types |
| Camera & QR | Expo Camera + Barcode Scanner | Gate visitor scanning |
| Biometrics | Expo Local Authentication | Fingerprint / FaceID app lock |
| Offline Support | WatermelonDB | SQLite-backed local DB |
| Maps | react-native-maps | Worker location tracking |
| Deep Links | Expo Linking | Calendar add, WhatsApp invites |

### Backend

| Layer | Technology | Note |
|---|---|---|
| Runtime | Node.js 20 LTS | Stable LTS release |
| Framework | Express.js + TypeScript | Modular, RESTful |
| Real-Time | Socket.io | WebSocket server — notifications, gate alerts, chat |
| Authentication | JWT (access + refresh token rotation) + OTP via MSG91 | Secure multi-device auth |
| Authorisation | RBAC middleware | Resident / Guard / Dept Head / Society Admin / Super Admin |
| Background Jobs | BullMQ + Redis | Reminders, auto-escalation, invoice generation, AI jobs |
| File Handling | Multer + AWS S3 / Cloudflare R2 | Photos, videos, documents |
| Email | Nodemailer + SendGrid | Transactional + announcement emails |
| SMS/WhatsApp | MSG91 / Twilio + WhatsApp Business API | OTP, visitor QR, payment reminders |
| AI Layer | 🔮 *Post-MVP:* Python microservice (FastAPI) | Maintenance prediction, sentiment analysis. MVP uses in-Node rule-based scoring instead (see [[#MVP Scope (v1)]]) |

### Database

| Store | Technology | Purpose |
|---|---|---|
| Primary DB | PostgreSQL 16 | All relational data — residents, bookings, payments, grievances |
| ORM | Prisma | Type-safe migrations and queries |
| Multi-tenancy | Row-Level Security (RLS) on `society_id` | Data isolation between societies |
| Cache & Sessions | Redis 7 | Sessions, OTP, rate limiting, BullMQ queues |
| Search | 🔮 *Post-MVP:* Meilisearch | Full-text search: services, residents, forum, marketplace. MVP uses Postgres `ILIKE`/full-text search |
| AI / Analytics | 🔮 *Post-MVP:* TimescaleDB extension | Time-series data for prediction model training |
| Vector Store | 🔮 *Post-MVP:* pgvector (optional) | Embedding-based similarity for AI recommendations |

### DevOps & Infrastructure

| Layer | Technology |
|---|---|
| Containers | Docker + Docker Compose (dev). 🔮 *Post-MVP:* Kubernetes (prod) |
| CI/CD | GitHub Actions — lint, test, build, deploy pipeline |
| Cloud | 🔮 *Post-MVP:* AWS (primary) — EKS, RDS, S3, CloudFront, SES |
| Portfolio Hosting | Vercel (frontend) + Render / Railway (API) + Supabase (DB) — MVP deploy target |
| Reverse Proxy | 🔮 *Post-MVP:* Nginx — load balancing, SSL termination |
| SSL | 🔮 *Post-MVP:* Let's Encrypt via cert-manager (auto-renewed) |
| Monitoring | 🔮 *Post-MVP:* Grafana + Prometheus. MVP relies on Sentry + Winston logs only |
| Error Tracking | Sentry (web) |
| Logging | Winston. 🔮 *Post-MVP:* Grafana Loki |
| Secrets | 🔮 *Post-MVP:* AWS Secrets Manager / HashiCorp Vault. MVP uses `.env` files |

### Third-Party Integrations

| Service | Provider | Use |
|---|---|---|
| Payments | Razorpay | UPI, cards, net banking, EMI, mandates |
| SMS & OTP | MSG91 / Twilio | OTP, alerts, WhatsApp Business API |
| Maps | Google Maps Platform | Geocoding, directions, live tracking |
| Worker KYC | 🔮 *Post-MVP:* Digio / Signzy | Background verification flow. MVP uses a manual admin "verified" toggle |
| Storage | AWS S3 / Cloudflare R2 | Documents, images, videos |
| Email | SendGrid | Transactional + bulk emails |
| Analytics | 🔮 *Post-MVP:* Mixpanel | Funnel analysis, feature adoption |
| AI Compute | 🔮 *Post-MVP:* AWS SageMaker / self-hosted FastAPI | Prediction models |
| IoT | 🔮 *Post-MVP:* AWS IoT Core | Smart lockers, intercom, sub-meters (future) |

---

## System Architecture

Beaverr follows a **multi-tier, multi-tenant architecture**. All services communicate via a central API Gateway. Real-time events flow through Socket.io backed by Redis pub/sub. Background jobs run in a BullMQ worker pool, isolated from the main API thread.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  Resident Web  │  Admin Web  │  Resident App  │  Guard App      │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / WSS
┌────────────────────────▼────────────────────────────────────────┐
│               API GATEWAY (Nginx)                               │
│    Rate limiting · SSL termination · Auth middleware            │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  APPLICATION LAYER                              │
│                                                                 │
│   ┌─────────────┐  ┌───────────────┐  ┌──────────────────┐    │
│   │  REST API   │  │  Socket.io    │  │  BullMQ Workers  │    │
│   │  (Express)  │  │  (Real-Time)  │  │  (Background)    │    │
│   └──────┬──────┘  └───────┬───────┘  └────────┬─────────┘    │
│          │                 │                    │               │
│   ┌──────▼─────────────────▼────────────────────▼──────────┐  │
│   │              SERVICE MODULES                            │  │
│   │  Auth · Residents · Units · Services · Grievances       │  │
│   │  Visitors · Events · Payments · Notifications · AI      │  │
│   └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      DATA LAYER                                 │
│   PostgreSQL + RLS  │  Redis  │  Meilisearch  │  TimescaleDB   │
└────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│  Razorpay · FCM · MSG91 · SendGrid · Google Maps · S3 · Digio  │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Models

All tables include `society_id` (multi-tenancy), `created_at`, and `updated_at`.

```prisma
model Society {
  id              String   @id @default(cuid())
  name            String
  code            String   @unique  // 6-digit alphanumeric
  address         String
  isRestrictedEntry Boolean @default(false)
  subscriptionPlan String  @default("free")
  adminUserId     String
}

model User {
  id          String   @id @default(cuid())
  societyId   String
  name        String
  email       String?
  phone       String
  role        Role     // RESIDENT | GUARD | DEPT_HEAD | SOCIETY_ADMIN | SUPER_ADMIN
  isActive    Boolean  @default(true)
  avatarUrl   String?
}

model Unit {
  id          String   @id @default(cuid())
  societyId   String
  block       String?
  floor       Int?
  unitNumber  String
  type        String   // 1BHK | 2BHK | 3BHK | VILLA
  ownerUserId String?
  tenantUserId String?
}

model Service {
  id              String  @id @default(cuid())
  societyId       String
  name            String
  description     String
  category        String  // MAINTENANCE | AMENITY | COMMUNITY
  subCategory     String
  isPaid          Boolean
  price           Float?
  durationEstMins Int
  isActive        Boolean @default(true)
}

model ServiceBooking {
  id            String   @id @default(cuid())
  serviceId     String
  residentId    String
  workerId      String?
  status        BookingStatus // PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | RESCHEDULED
  scheduledAt   DateTime
  completedAt   DateTime?
  rating        Int?
  ratingNote    String?
}

model Worker {
  id              String  @id @default(cuid())
  societyId       String
  name            String
  phone           String
  skills          String[]
  ratingAvg       Float   @default(0)
  reputationScore Float   @default(50)
  isVerified      Boolean @default(false)
  isAvailable     Boolean @default(true)
}

model Grievance {
  id              String   @id @default(cuid())
  societyId       String
  raisedByUserId  String
  type            String   // WORKER | NEIGHBOUR | MANAGEMENT | INFRASTRUCTURE
  againstUserId   String?
  description     String
  mediaUrls       String[]
  status          GrievanceStatus // OPEN | IN_REVIEW | RESOLVED | CLOSED
  assignedToId    String?
  isAnonymous     Boolean  @default(false)
  resolvedAt      DateTime?
}

model Visitor {
  id            String   @id @default(cuid())
  societyId     String
  residentId    String
  visitorName   String
  visitorPhone  String?
  photoUrl      String?
  entryAt       DateTime?
  exitAt        DateTime?
  qrToken       String?  @unique
  status        VisitorStatus // PENDING | APPROVED | DENIED | INSIDE | EXITED
  isBlacklisted Boolean  @default(false)
}

model Payment {
  id          String   @id @default(cuid())
  userId      String
  societyId   String
  unitId      String
  amount      Float
  type        String   // MAINTENANCE | SERVICE | MARKETPLACE
  gatewayRef  String?
  status      PaymentStatus // PENDING | PAID | FAILED | REFUNDED
  paidAt      DateTime?
  invoiceUrl  String?
}

model MarketplaceListing {
  id          String   @id @default(cuid())
  societyId   String
  sellerId    String
  category    String   // SERVICE | SELL | RENT | BULK_ORDER
  title       String
  description String
  price       Float?
  isApproved  Boolean  @default(false)
  isActive    Boolean  @default(true)
}
```

---

## Security & Compliance

| Area | Implementation |
|---|---|
| Multi-Tenancy Isolation | PostgreSQL Row-Level Security (RLS) on `society_id` — no cross-society data leakage |
| Authentication | JWT with 15-min access tokens + rotating 7-day refresh tokens in HttpOnly cookies |
| OTP Verification | Mobile OTP at signup; rate-limited to 3 attempts before cooldown |
| RBAC | 5 roles with granular permission matrices per API endpoint |
| Data Encryption | AES-256 at rest for PII (Aadhaar refs, payment details); TLS 1.3 in transit |
| Compliance | Data residency in India (Mumbai AWS region); GDPR-aligned consent flows; data deletion on request |
| Rate Limiting | Redis-backed: 100 req/min per resident, 500 req/min per admin |
| Audit Logs | All admin actions logged: actor, timestamp, action, before/after diff |
| Payment Security | PCI-DSS delegated to Razorpay; Beaverr stores zero raw card data |
| Media Validation | MIME type check, file size limit, virus signature scan before S3 storage |
| API Security | Helmet.js (HTTP headers), CORS whitelist, SQL injection prevention via Prisma |

---

## Development Roadmap

> The active roadmap is the MVP phase plan in [[#MVP Scope (v1)]] — Phases 1–5, web-only (`resident-web` + `admin-web`), no separate AI microservice. The table below is the original full-platform roadmap, kept for reference as the long-term vision; everything from Phase 6 onward (and the mobile/guard app work folded into Phase 3/9 here) is now [[#Future Extensions]].

| Phase | Timeline | Deliverables |
|---|---|---|
| **MVP Phase 1** | — | DB schema, Auth (JWT + OTP), Society & Resident onboarding, Unit management, Admin CRUD |
| **MVP Phase 2** | — | Service catalogue, Booking flow + SLA engine, Worker management, rule-based auto-assign |
| **MVP Phase 3** | — | Grievance lifecycle, Visitor/Gate management via Gate Console, in-app + email notifications |
| **MVP Phase 4** | — | Payments (Razorpay), Invoice generation, Due reminders, basic admin analytics/reports |
| **MVP Phase 5 (stretch)** | — | Events board, Community forum, Announcements, Society directory, Document storage |
| 🔮 *Post-MVP* | — | Security guard sub-app (Expo), resident mobile app (Expo), push/SMS/WhatsApp notifications |
| 🔮 *Post-MVP* | — | Community Marketplace — listings, ratings, neighbour services |
| 🔮 *Post-MVP* | — | Real AI layer (Python FastAPI) — maintenance prediction, ML-based scoring, sentiment analysis |
| 🔮 *Post-MVP* | — | Mixpanel integration, multilingual support (Hindi + regional) |
| 🔮 *Post-MVP* | — | Full E2E suite (Playwright/Detox across all apps), performance audit at scale, Kubernetes/Terraform production deploy |

---

## Deployment Strategy

### Development Environment

```bash
# One command to spin up entire local stack (MVP)
docker compose up

# Services started:
# - PostgreSQL 16
# - Redis 7
# - Node.js API (hot reload)
# - Next.js Resident Portal (hot reload)
# - Next.js Admin Portal (hot reload)
# 🔮 Post-MVP additions once built: Meilisearch, Python FastAPI AI microservice

# DB migrations
npx prisma migrate dev

# Seed demo society data
npm run seed
```

### Portfolio Hosting (Free / Low Cost)

| Service | Provider | Cost |
|---|---|---|
| Resident & Admin Frontend | Vercel | Free tier |
| Backend API | Render.com | Free tier |
| PostgreSQL | Supabase | Free tier (500 MB) |
| Redis | Upstash | Free tier (10,000 commands/day) |
| Search | 🔮 *Post-MVP:* Meilisearch Cloud | Free tier |
| Storage | Cloudflare R2 | Free (10 GB) |
| Mobile App | 🔮 *Post-MVP:* Expo EAS Build | Free (limited builds) |

### Production Scaling Path

- Horizontal API scaling via Kubernetes with Nginx load balancer
- PostgreSQL read replicas for analytics query isolation
- CDN (CloudFront / Cloudflare) for all static and media assets
- BullMQ workers scaled independently from API
- Rate limiting at Nginx + Cloudflare edge

---

## Non-Functional Requirements

These define the **system constraints** Beaverr must operate within, not just what it does.

### Performance

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200 ms |
| Service booking confirmation | < 500 ms |
| Real-time visitor approval push (Socket.io) | < 1 second end-to-end |
| Search results (Postgres for MVP; 🔮 *Post-MVP* Meilisearch) | < 100 ms |
| Invoice PDF generation | < 3 seconds (async, BullMQ) |
| Dashboard analytics query | < 1 second (read replica) |

### Scalability

| Dimension | Target |
|-----------|--------|
| Residents per society | Up to 10,000 |
| Concurrent connected users (Socket.io) | Up to 1,000 |
| Societies on platform | Up to 500 (portfolio phase) |
| Bookings processed per day | Up to 5,000 |
| Notification throughput | Up to 50,000/day (BullMQ) |

### Availability

- Target uptime: **99.5%** (portfolio/staging environment)
- Target uptime: **99.9%** (production SLA if commercialised)
- Graceful degradation: auto-assignment falls back to the admin manual-assign queue if no eligible worker scores above the availability threshold (MVP has no separate AI service to fail — this degradation path still applies to the in-Node rule-based scorer)
- Graceful degradation: if Razorpay is unreachable, payment form shows maintenance notice

### Security

- All sensitive endpoints require JWT + RBAC validation
- OTP rate-limited to 3 attempts per 5 minutes per phone number
- PII (phone, Aadhaar refs) encrypted AES-256 at rest
- Zero raw card data stored — all delegated to Razorpay PCI-DSS vault
- All file uploads virus-scanned before storage

---

## Core Backend Module Breakdown

A formal module checklist — each item maps directly to a folder in `services/api/src/modules/`. Phase numbers below refer to the MVP phases in [[#MVP Scope (v1)]] (1–5); 🔮 marks modules deferred to post-MVP.

| # | Module | Key Responsibility | MVP Phase |
|---|--------|--------------------|-------|
| 1 | `auth` | OTP login, JWT issue/refresh, RBAC | 1 |
| 2 | `societies` | Society creation, 6-digit code, departments | 1 |
| 3 | `residents` | Resident CRUD, CSV bulk import, vehicles | 1 |
| 4 | `units` | Unit master, ownership transfer | 1 |
| 5 | `services` | Service catalogue, categories, Postgres search | 2 |
| 6 | `bookings` | Booking lifecycle, SLA engine, rule-based auto-assign | 2 |
| 7 | `workers` | Worker profiles, scheduling, reputation score | 2 |
| 8 | `notifications` | Inbox, email preferences (🔮 FCM push/SMS/WhatsApp post-MVP) | 3 |
| 9 | `grievances` | Complaint lifecycle, escalation, anonymous mode | 3 |
| 10 | `visitors` | QR generation, gate log (via Gate Console), blacklist, whitelist | 3 |
| 15 | `payments` | Razorpay orders, webhooks, invoicing, mandates | 4 |
| 18 | `analytics` | Dashboard aggregations, report exports | 4 |
| 11 | `events` | Event RSVP, photo albums, expense tracking | 5 (stretch) |
| 12 | `forum` | Threads, replies, polls, moderation | 5 (stretch) |
| 13 | `announcements` | Rich-text circulars, audience targeting, read receipts | 5 (stretch) |
| 14 | `documents` | Society document upload/download | 5 (stretch) |
| 17 | `emergency` | SOS broadcast, evacuation tracker | 5 (stretch) |
| 16 | `marketplace` | Listings, moderation, bulk orders | 🔮 Post-MVP |

---

## State Machines

Defining these prevents logic bugs and makes the booking/grievance/payment flows deterministic.

### Service Booking

```
                    ┌─────────────┐
              ┌────►│  CANCELLED  │
              │     └─────────────┘
┌─────────┐   │     ┌─────────────┐
│ PENDING ├───┤────►│ RESCHEDULED │
└────┬────┘   │     └──────┬──────┘
     │        │            │
     ▼        │            ▼
┌──────────┐  │     ┌─────────────┐
│CONFIRMED ├──┘     │  CONFIRMED  │ (new slot)
└────┬─────┘        └─────────────┘
     │
     ▼
┌─────────────┐
│ IN_PROGRESS │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  COMPLETED  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    RATED    │ (optional terminal state)
└─────────────┘
```

**Rules:**
- Cancellation only allowed if status is `PENDING` or `CONFIRMED`
- Reschedule only allowed up to 4 hours before `scheduledAt`
- Rating only allowed after `COMPLETED`; moves status to `RATED`

---

### Grievance / Complaint

```
┌──────┐   ┌───────────┐   ┌──────────┐   ┌────────┐
│ OPEN ├──►│ IN_REVIEW ├──►│ RESOLVED ├──►│ CLOSED │
└──────┘   └───────────┘   └──────────┘   └────────┘
    │                            ▲
    │   (auto-escalation         │
    │    past SLA)               │
    └───────────────────────────►┘
         escalated to admin
```

**Rules:**
- `OPEN` → `IN_REVIEW` when admin assigns to department
- `IN_REVIEW` → `RESOLVED` when admin posts resolution summary
- `RESOLVED` → `CLOSED` after 48-hour resident review window (auto-close if no dispute)
- Auto-escalation: if `IN_REVIEW` for > SLA hours → flag as `CRITICAL` priority

---

### Visitor Entry

```
┌─────────┐   APPROVED   ┌────────┐   EXIT   ┌────────┐
│ PENDING ├─────────────►│ INSIDE ├─────────►│ EXITED │
└────┬────┘              └────────┘           └────────┘
     │
     │ DENIED
     ▼
┌────────┐
│ DENIED │
└────────┘
```

**Rules:**
- `PENDING` is set when walk-in is logged by guard OR when pre-approval is created
- Pre-approved QR scan: directly transitions to `INSIDE` (no resident approval needed)
- Walk-in: stays `PENDING` until resident approves/denies (with 2-minute auto-deny timeout)
- Blacklisted visitors: immediately `DENIED` with security alert on scan

---

### Payment

```
┌─────────┐   CAPTURED   ┌──────┐
│ PENDING ├─────────────►│ PAID │
└────┬────┘              └──────┘
     │
     │ FAILED           ┌──────────┐
     └─────────────────►│  FAILED  │
                        └──────────┘

┌──────┐   REFUND_INITIATED   ┌──────────┐
│ PAID ├────────────────────►│ REFUNDED │
└──────┘                      └──────────┘
```

**Rules:**
- `PENDING` is created when Razorpay order is initiated
- `PAID` only set after webhook `payment.captured` with valid signature
- `FAILED` set on webhook `payment.failed`
- `REFUNDED` set on webhook `refund.processed`
- Never set payment status from frontend — **only from verified Razorpay webhook**

---

## API Design Conventions

These rules keep the backend consistent as it grows across 18 modules.

### URL Structure

```
GET    /api/services              → list
GET    /api/services/:id          → single resource
POST   /api/services              → create
PATCH  /api/services/:id          → partial update
DELETE /api/services/:id          → delete (soft)

# Nested resources
GET    /api/residents/:id/bookings
GET    /api/societies/:id/workers

# State transitions (use sub-resource, not verbs)
PATCH  /api/bookings/:id/status
PATCH  /api/bookings/:id/reschedule
PATCH  /api/grievances/:id/assign
POST   /api/bookings/:id/rate

# Admin-scoped routes
GET    /api/admin/bookings
GET    /api/admin/analytics/dashboard
```

### Rules

- **Plural resource names** always: `/bookings` not `/booking`
- **No verbs in endpoints**: `/bookings/:id/cancel` not `/cancelBooking/:id`
- **Admin routes** prefixed with `/api/admin/` — RBAC applied at router level
- **Super-admin routes** prefixed with `/api/super-admin/`
- **Versioning**: no versioning for portfolio phase; if needed in future → `/api/v2/`

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 154
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "WORKER_NOT_AVAILABLE",
    "message": "No workers are available for the selected time slot.",
    "details": {}
  }
}
```

---

## Error Handling Strategy

A consistent error format makes frontend error handling simple and debugging easy.

### Error Code Registry

| Code | HTTP Status | When |
|------|-------------|------|
| `VALIDATION_ERROR` | 400 | Zod schema validation failed |
| `UNAUTHENTICATED` | 401 | JWT missing or expired |
| `TOKEN_EXPIRED` | 401 | Access token expired (prompt refresh) |
| `FORBIDDEN` | 403 | Valid JWT but insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist |
| `SOCIETY_CODE_INVALID` | 400 | Society code not found on registration |
| `OTP_INVALID` | 400 | OTP does not match |
| `OTP_EXPIRED` | 400 | OTP TTL elapsed |
| `OTP_RATE_LIMITED` | 429 | Too many OTP attempts |
| `WORKER_NOT_AVAILABLE` | 409 | No worker found for auto-assign |
| `BOOKING_CANCEL_WINDOW_CLOSED` | 409 | Cancellation attempted < 4 hours before |
| `SLOT_ALREADY_BOOKED` | 409 | Conflicting booking for same slot |
| `PAYMENT_SIGNATURE_INVALID` | 400 | Razorpay webhook signature mismatch |
| `BLACKLISTED_VISITOR` | 403 | Visitor is on blacklist |
| `VISITOR_ALREADY_INSIDE` | 409 | Duplicate entry attempt |
| `RATE_LIMITED` | 429 | Generic rate limit hit |
| `INTERNAL_ERROR` | 500 | Unhandled exception (logged to Sentry) |

### Global Error Handler

All errors funnel through `error.middleware.ts`:

```typescript
// All thrown errors in services use this class
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: object
  ) { super(message); }
}

// Global handler returns standard format
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details }
    });
  }
  // Unhandled: log to Sentry, return 500
  Sentry.captureException(err);
  return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } });
});
```

---

## Feature Flags

Each society can independently enable/disable modules. Stored in the `Society` table as a JSON config column.

> **MVP note:** `FEATURE_MARKETPLACE` and `FEATURE_AI_PREDICTIONS` already default to `false` below — they stay off until the corresponding post-MVP work lands. No schema change needed when that work starts.

### Available Flags

| Flag | Default | Description |
|------|---------|-------------|
| `FEATURE_VISITOR_MANAGEMENT` | `true` | Gate module, QR invites, blacklist |
| `FEATURE_MARKETPLACE` | `false` | Community economy listings |
| `FEATURE_AI_PREDICTIONS` | `false` | Maintenance prediction AI cards |
| `FEATURE_PAYMENTS` | `true` | Razorpay dues + invoicing |
| `FEATURE_FORUM` | `true` | Community forum threads |
| `FEATURE_EMERGENCY_SOS` | `true` | SOS button and broadcasts |
| `FEATURE_EVENTS` | `true` | Events board and RSVP |
| `FEATURE_DOCUMENTS` | `true` | Society document storage |

### How Flags Are Enforced

**Backend:** RBAC middleware checks feature flag before processing request.
```typescript
// Middleware: requireFeature('FEATURE_MARKETPLACE')
const society = await societyRepo.findById(req.societyId);
if (!society.features.FEATURE_MARKETPLACE) {
  throw new AppError('FEATURE_DISABLED', 'This feature is not enabled for your society.', 403);
}
```

**Frontend:** Feature flag object is returned in the `/api/auth/me` response; UI components render/hide based on flags.
```typescript
const { features } = useAuthStore();
if (!features.FEATURE_MARKETPLACE) return null; // Don't render nav item
```

This architecture makes Beaverr **SaaS-ready** — different subscription tiers can enable different feature sets.

---

## Data Lifecycle & Retention

Defines what happens to data over time — a requirement in any production system.

| Data Type | Retention Period | Action After Period |
|-----------|-----------------|---------------------|
| Visitor logs | 90 days | Auto-archived (read-only), purged after 1 year |
| Payment records | 7 years | Archived to cold storage (compliance) |
| Audit logs | 2 years | Compressed and archived |
| Grievance records | 2 years after closure | Anonymised (remove personal details) |
| Media uploads (photos/docs) | 2 years after entity deletion | Auto-deleted from S3/R2 |
| Inactive resident accounts | Archived after 12 months of inactivity | Admin prompted to review |
| OTP records | 5 minutes (Redis TTL) | Auto-expired by Redis |
| Refresh tokens | 7 days (Redis TTL) | Auto-expired by Redis |
| BullMQ job history | 30 days | Auto-cleaned by BullMQ config |
| Notification inbox | 6 months | Auto-archived |

### Implementation Notes

- Retention cleanup runs as a **nightly BullMQ cron job** (`dataRetention.job.ts`)
- Soft-delete pattern used everywhere (`deletedAt` timestamp, not hard delete)
- Hard purge only runs after retention window via the cron job
- Resident can request full data export or deletion (GDPR-aligned)

---

## Rate Limiting Policy

All limits are enforced via Redis-backed middleware. Exceeding a limit returns `429` with `Retry-After` header.

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| `POST /auth/send-otp` | 3 requests | 5 minutes per phone |
| `POST /auth/verify-otp` | 5 attempts | 5 minutes per phone |
| `POST /auth/login` | 10 requests | 1 minute per IP |
| `POST /bookings` | 10 requests | 1 minute per user |
| `PATCH /visitors/:id/approve` | 30 requests | 1 minute per user |
| `POST /emergency/sos` | 3 requests | 10 minutes per user |
| `POST /payments/initiate` | 5 requests | 1 minute per user |
| General resident endpoints | 100 requests | 1 minute per user |
| General admin endpoints | 500 requests | 1 minute per user |
| File upload endpoints | 20 requests | 1 minute per user |
| Razorpay webhook | No limit | Signature-validated |

---

## Testing Strategy

### Overview

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Jest | Service layer business logic, utility functions |
| Integration | Supertest + Jest | API endpoints — full request/response cycle |
| E2E (Web) | Playwright | Critical user flows on resident + admin web |
| E2E (Mobile) | Detox | Core mobile flows (login, booking, SOS) |
| Load | k6 | API throughput and latency under simulated load |

### Unit Test Coverage Targets

| Module | Priority | What to Test |
|--------|----------|-------------|
| `bookings.service` | High | SLA calculation, auto-assign scoring, state transition guards |
| `auth.service` | High | OTP generation, JWT issue, refresh token rotation |
| `payments.service` | High | Razorpay signature verification, webhook processing |
| `workers.service` | High | Reputation score formula |
| `grievances.service` | Medium | Auto-escalation logic |
| `notifications.service` | Medium | Queue dispatch, preference filtering |

### Key E2E Scenarios (Playwright)

1. Resident registers with society code → OTP → dashboard visible
2. Resident books a service → worker assigned → status updates in real-time
3. Guard logs walk-in → resident receives push → approves → guard notified
4. Resident raises grievance → admin resolves → resident sees resolution
5. Admin generates monthly invoices → resident pays via Razorpay → receipt downloaded
6. Admin creates announcement → residents receive push notification

### Test Database

- Separate PostgreSQL database seeded fresh before each integration test run
- Prisma `migrate reset` + seed run in CI before test suite
- Redis: separate DB index (`SELECT 1`) used for tests to avoid polluting dev cache

---

## Observability

> **MVP note:** Only Sentry (error tracking) and Winston (structured logging) are in scope for MVP. Prometheus/Grafana metrics, Grafana Loki log aggregation, and OpenTelemetry distributed tracing below are 🔮 *Post-MVP* — worth adding once there's real traffic to observe.

### Metrics (Prometheus + Grafana) 🔮 *Post-MVP*

| Metric | Type | Description |
|--------|------|-------------|
| `api_request_duration_ms` | Histogram | p50/p95/p99 per route |
| `api_request_total` | Counter | Total requests by route + status |
| `booking_created_total` | Counter | Bookings per society per day |
| `booking_sla_breached_total` | Counter | SLA breaches for alerting |
| `queue_job_duration_ms` | Histogram | BullMQ processing time per queue |
| `queue_job_failed_total` | Counter | Failed jobs by queue name |
| `socket_connections_active` | Gauge | Live Socket.io connections |
| `payment_success_rate` | Gauge | Rolling 24h payment success % |

### Logging (Winston + Grafana Loki 🔮 *Post-MVP*)

| Log Level | When |
|-----------|------|
| `info` | All incoming requests, queue job completions |
| `warn` | Slow queries (> 500ms), retried jobs, rate limit hits |
| `error` | Unhandled exceptions, external service failures |
| `audit` | All admin mutations — actor, action, before/after diff |

Log format: structured JSON with `{ timestamp, level, requestId, userId, societyId, message, meta }`.

### Error Tracking (Sentry)

- All unhandled exceptions captured with full stack trace
- User context attached: `userId`, `societyId`, `role`
- Source maps uploaded in CI for readable stack traces
- Alert rules: > 10 errors/min on any endpoint → Slack notification

### Distributed Tracing (OpenTelemetry) 🔮 *Post-MVP*

- Trace context propagated from API → BullMQ jobs → AI microservice
- Key traces: booking creation (API → auto-assign → worker notification)
- Viewer: Grafana Tempo or Jaeger

### Alerting Rules 🔮 *Post-MVP*

| Alert | Threshold | Channel |
|-------|-----------|---------|
| API error rate spike | > 5% of requests returning 5xx | Slack |
| Queue job backlog | > 500 pending jobs | Slack |
| SLA breach rate | > 10% in 1 hour | Slack + Email |
| Database connection pool | > 80% utilisation | Slack |
| Payment failure spike | > 20% failure rate in 30 min | Slack + Email |

---

## Future Extensions

Features intentionally deferred beyond the current roadmap — tracked here to avoid scope creep during development.

### Deferred From MVP (v1 → v2)

These are fully specified elsewhere in this document but explicitly out of scope until after MVP ships (see [[#MVP Scope (v1)]]):

| Item | Where it's specified | Why deferred |
|---|---|---|
| `mobile-app` (Expo, resident) | [[#Technology Stack]] → Mobile Apps, `Frontend Development.md` | Prove backend + web UX first; avoids parallel native build/EAS complexity during core-loop development |
| `guard-app` (Expo, security) | [[#Technology Stack]] → Mobile Apps, `Frontend Development.md` | MVP uses a "Gate Console" page in `admin-web` behind the `GUARD` role instead |
| AI microservice (Python FastAPI) | [[#AI-Powered & Smart Features]], `Backend Development.md` §15 | Auto-assign + reputation scoring formulas run as plain TypeScript in MVP; real ML needs production data to be worth building |
| Community Economy / Marketplace | [[#Community Economy Layer]] | Depends on a trusted, active resident base first — needs the core service loop live |
| Meilisearch / TimescaleDB / pgvector | [[#Technology Stack]] → Database | Postgres full-text search + plain queries are sufficient at MVP scale |
| Digio / Signzy worker KYC | [[#Technology Stack]] → Third-Party Integrations | Manual admin "verified" toggle is sufficient until real background-check volume justifies the integration |
| WhatsApp Business API, FCM push, SMS (MSG91) | [[#Technology Stack]] → Backend, Notifications | No mobile app yet to receive push; in-app + email notifications cover MVP |
| Mixpanel | [[#Technology Stack]] → Third-Party Integrations | Add once there are real users to analyze |
| Kubernetes, Terraform, Nginx, AWS EKS/CloudFront | [[#Technology Stack]] → DevOps & Infrastructure | Vercel + Render/Railway + Supabase free tiers are sufficient for a portfolio-scale deploy |
| Prometheus/Grafana, Grafana Loki, OpenTelemetry | [[#Observability]] | Sentry + Winston logs are enough signal until there's real production traffic |

### Infrastructure & IoT

- **Smart parcel lockers** — OTP-dispensed lockers at gate; AWS IoT Core integration
- **Smart intercom** — Video doorbell integration with mobile app answer
- **Sub-meter readings** — Electricity/water per-unit digital meter reading via IoT sensors
- **Parking sensor system** — Ultrasonic sensors at parking bays → real-time availability map

### Platform Features

- **Multi-language support** — Hindi + 5 regional languages (i18n with `next-intl`)
- **Society federation** — Township-level view for developers managing multiple societies
- **Resident mobile number portability** — Transfer resident profile when moving societies
- **WhatsApp-native flows** — Core approvals (visitor, payment reminders) without opening the app
- **Voice assistant integration** — "Book a plumber for tomorrow morning" via Google Assistant

### Financial Features

- **Society P&L automation** — Connect to bank account via account aggregator for auto-reconciliation
- **Group buying aggregation** — Platform-negotiated bulk rates with FMCG brands
- **Subscription tiers** — Free / Growth / Pro plans with feature flag mapping

### AI & Analytics

- **Computer vision at gate** — Face recognition for frequent visitors and domestic staff
- **Predictive defaulter scoring** — ML model flags residents likely to miss next payment
- **Sentiment heatmap** — Society health score based on grievance themes over time
- **Energy consumption analytics** — Correlate utility costs with occupancy patterns

---

## Risks & Tradeoffs

Honest engineering decisions documented with rationale.

### Architecture Tradeoffs

| Decision | Alternatives Considered | Chosen Approach | Rationale |
|----------|------------------------|-----------------|-----------|
| Multi-tenant: single DB with RLS | Separate DB per society | Single PostgreSQL DB + Row-Level Security | Lower infrastructure cost; simpler migrations; easier cross-society analytics for super-admin; RLS provides strong isolation |
| Monorepo vs polyrepo | Separate repos per app | Turborepo monorepo | Shared types prevent drift; single PR for cross-cutting changes; easier local dev with one `docker compose up` |
| REST vs GraphQL | GraphQL, tRPC | REST with standardised response format | Simpler mental model; easier to document; sufficient for all identified use cases; avoids N+1 problem without extra tooling |
| BullMQ vs inline processing | Inline async/await | BullMQ with Redis | Keeps API response times < 200ms; notifications/invoices are non-blocking; retries and dead-letter queues built-in |
| AI as microservice vs embedded | Embed Python in Node via edge functions | Separate FastAPI microservice — 🔮 *Post-MVP; MVP uses plain TypeScript formulas in-process instead* | Python ML ecosystem incompatible with Node; independent scaling; can be replaced/updated without API deploy |
| Guard as separate app vs same app | Same Expo app with role-based screens | Separate `guard-app` Expo project — 🔮 *Post-MVP; MVP uses a `GUARD`-role page inside `admin-web` instead* | Different bundle ID, simpler UI, can be distributed separately to security staff devices; no accidental access to resident features |

### Known Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Razorpay API downtime | Low | High | Show graceful error; queue retry; log for manual reconciliation |
| SMS OTP delivery failure (MSG91) | Medium | High | Fallback to email OTP; retry with exponential backoff |
| Redis downtime | Low | High | BullMQ jobs pause; sessions invalidated; add Redis Sentinel for HA in production |
| Meilisearch index out of sync | Medium | Medium | Index rebuilt from DB on startup; nightly re-sync job |
| Socket.io connection drops | Medium | Medium | Client auto-reconnects with exponential backoff; missed events fetched via REST on reconnect |
| AI microservice cold start | Medium | Low | Fallback to manual admin assignment queue; does not block booking creation |
| Large CSV import failures | Medium | Medium | Row-level error reporting; partial success allowed; failed rows returned for manual fix |

---

## Why This Project on a Resume

Companies hiring junior-to-mid developers don't expect original startups. They want evidence of **real engineering judgement**. Beaverr demonstrates exactly that.

| Signal | What It Shows |
|--------|---------------|
| Multi-tenancy with RLS | You understand database-level security, not just application-level |
| RBAC with 5 roles | You've thought about permission systems beyond "admin vs. user" |
| BullMQ + Redis worker pool | You know how to keep APIs fast by offloading slow work |
| Socket.io real-time layer | You've implemented bidirectional communication, not just REST |
| AI microservice (FastAPI) | You can integrate ML models into a production system |
| Prisma + typed migrations | You treat the database schema as code |
| Docker Compose local stack | You can set up reproducible dev environments |
| Full booking + SLA engine | You've modelled complex business logic with state machines |
| Razorpay payment integration | You've handled real money flows and webhooks |
| React Native (Expo) mobile app | You deliver on multiple platforms from one codebase |
| Non-functional requirements | You design for performance targets, not just features |
| State machines for flows | You prevent logic bugs with explicit state transition rules |
| Feature flags system | You think about SaaS multi-tenancy at architecture level |
| Observability layer | You understand that building the system is only half the job |
| Error code registry | You design APIs that frontend developers can actually use |
| Risks & tradeoffs section | You make deliberate decisions and can justify them in interviews |

**Talking points for interviews:**
- *"I designed a multi-tenant PostgreSQL schema using Row-Level Security so every society's data is isolated without separate databases."*
- *"I built an auto-assignment algorithm that scores and ranks workers based on availability, skills, and reputation score."*
- *"I used BullMQ to process all notifications asynchronously — the API stays under 100ms regardless of notification load."*
- *"I defined state machines for bookings and grievances upfront so the service layer enforces valid transitions and the UI always reflects true system state."*
- *"I designed a feature flags system per society so different subscription tiers can unlock different modules — making the platform SaaS-ready from day one."*

---

## Brand Identity

> **Design system note:** a high-end, agency-grade visual direction (see `Frontend Development.md` §13) is the primary driver of `resident-web`/`admin-web` visual implementation (typography stack, card structure, motion). This table stays the source of "flavor" — brand colours, tone of voice, name/tagline — that feeds the Vibe Archetype selection; that direction drives the concrete execution.

| Element | Decision |
|---|---|
| **Name** | Beaverr — double 'r' creates a distinctive, memorable, domain-friendly spelling |
| **Tagline** | *"Where houses become homes"* |
| **Sub-positioning** | Smart Infrastructure for Residential Communities |
| **Logo Concept** | Geometric beaver silhouette integrated with a building/shelter icon — clean, modern, minimal |
| **Primary Colour** | Deep Navy `#1A3C5E` — trust, stability |
| **Accent Colour** | Teal `#0F7173` — community, freshness |
| **Warm Accent** | Amber `#F4A261` — warmth, home |
| **Typography** | Plus Jakarta Sans (headings, skill-whitelisted) + Geist (body) — the skill bans Inter, so body copy moved to Geist; see `Frontend Development.md` §13 |
| **Tone of Voice** | Friendly, reliable, community-first — like a helpful society secretary available 24/7 |
| **Brand Promise** | Beaverr doesn't just manage your society — it builds the community inside it |

---

*Beaverr — Where Houses Become Homes*
*Version 2.0 | 2025 | Portfolio Project*

---

> **Tags:** `#project` `#fullstack` `#portfolio` `#react-native` `#nextjs` `#nodejs` `#postgresql` `#system-design` `#beaverr`
