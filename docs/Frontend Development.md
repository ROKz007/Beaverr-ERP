# 🦫 Beaverr — Frontend Development Guide

> **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Zustand + TanStack Query + Socket.io + React Native (Expo)

> **MVP note:** See `Project Description.md` → MVP Scope (v1). For MVP, only `resident-web` (§2) and `admin-web` (§3) are being built. §4 Mobile App and the Guard Sub-App are 🔮 *Post-MVP* — gate/visitor scanning for MVP is handled by a new "Gate Console" page inside `admin-web` (added under §3) instead.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Resident Web Portal — Pages & Components](#2-resident-web-portal--pages--components)
3. [Admin Web Portal — Pages & Components](#3-admin-web-portal--pages--components)
4. [Mobile App (React Native + Expo)](#4-mobile-app-react-native--expo)
5. [Shared Packages](#5-shared-packages-packages)
6. [Shared State Management](#6-shared-state-management)
7. [API Layer (TanStack Query + Axios)](#7-api-layer-tanstack-query--axios)
8. [Real-Time (Socket.io Client)](#8-real-time-socketio-client)
9. [Authentication Flow](#9-authentication-flow)
10. [Forms (React Hook Form + Zod)](#10-forms-react-hook-form--zod)
11. [Payments (Razorpay)](#11-payments-razorpay)
12. [File Uploads](#12-file-uploads)
13. [Design System & Theming](#13-design-system--theming)
14. [Error Handling](#14-error-handling-frontend)
15. [Feature Flags](#15-feature-flags-frontend)
16. [Observability](#16-observability-frontend)

---

## 1. Project Structure

> All frontend apps live under `apps/` in the Beaverr monorepo. See `folder_structure.md` for the full repo layout.

```
apps/
│
├── resident-web/                  # Next.js 14 — Resident Portal (PWA)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── otp/page.tsx
│   │   ├── (resident)/            # Protected layout with sidebar/nav
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── services/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── book/page.tsx
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── grievances/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── visitors/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pre-approve/page.tsx
│   │   │   │   └── whitelist/page.tsx
│   │   │   ├── events/
│   │   │   ├── forum/
│   │   │   ├── marketplace/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   ├── announcements/
│   │   │   ├── documents/
│   │   │   └── directory/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui overrides + custom atoms
│   │   ├── layout/                # Sidebar, TopNav, MobileNav
│   │   └── [feature]/             # Feature-specific components
│   ├── hooks/                     # Custom React hooks (useSocket, useAuth, etc.)
│   ├── lib/
│   │   ├── api.ts                 # Axios instance
│   │   └── auth.ts                # Token helpers
│   ├── store/                     # Zustand stores
│   └── utils/
│
├── admin-web/                     # Next.js 14 — Admin Portal (dark theme)
│   ├── app/
│   │   ├── (auth)/
│   │   └── (admin)/
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── residents/
│   │       ├── units/
│   │       ├── services/
│   │       ├── workers/
│   │       ├── bookings/
│   │       ├── grievances/
│   │       ├── visitors/
│   │       ├── events/
│   │       ├── billing/
│   │       ├── marketplace/
│   │       ├── announcements/
│   │       ├── documents/
│   │       ├── forum/
│   │       ├── analytics/
│   │       └── settings/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── [feature]/
│   ├── charts/                    # Recharts + D3 chart components (admin-specific)
│   ├── hooks/
│   ├── store/
│   └── lib/
│
├── mobile-app/                    # React Native (Expo) — Resident mobile app
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── otp.tsx
│   │   └── (tabs)/               # Bottom tab navigator
│   │       ├── index.tsx          # Dashboard
│   │       ├── services.tsx
│   │       ├── visitors.tsx
│   │       ├── payments.tsx
│   │       └── more.tsx
│   ├── screens/                   # Full screens outside tab nav
│   │   ├── BookingDetailScreen.tsx
│   │   ├── GrievanceScreen.tsx
│   │   ├── MarketplaceScreen.tsx
│   │   └── EmergencySOSScreen.tsx
│   ├── components/
│   ├── navigation/                # Expo Router config, deep link setup
│   ├── api/                       # Axios instance + React Query hooks (mobile)
│   ├── store/                     # Zustand stores (mobile)
│   └── utils/
│
└── guard-app/                     # React Native (Expo) — Separate Guard sub-app
    ├── app/
    │   ├── (auth)/
    │   └── (gate)/
    │       ├── index.tsx          # Main gate screen — today's visitor log
    │       ├── scan.tsx           # Expo Barcode Scanner full-screen
    │       └── walkin.tsx         # Log walk-in visitor with camera
    ├── components/
    ├── navigation/
    ├── api/
    └── store/
```

---

## 2. Resident Web Portal — Pages & Components

### Authentication Pages (`/app/(auth)/`)

| Route | Page | Components Needed |
|-------|------|-------------------|
| `/login` | Phone + OTP Login | `PhoneInput`, `OTPInput` (6-digit), `ResendOTP` timer |
| `/register` | Sign Up | `SocietyCodeInput` (validates live), `PhoneInput`, `NameInput`, `UnitSelector` |
| `/onboarding` | Post-signup setup | `AvatarUpload`, `VehicleAdd`, `NotificationPermissions` |

---

### Dashboard (`/app/(resident)/dashboard/`)

**Page: `DashboardPage`**

Components:
- `WelcomeBanner` — greeting with resident name + unit
- `QuickActionsBar` — icon buttons: Book Service · Report Grievance · Approve Visitor · Pay Dues · SOS
- `ActiveBookingCard` — shows in-progress booking with real-time worker location map
- `PendingActionsWidget` — badge count for pending visitor approvals, unread grievance updates
- `UpcomingEventsCarousel` — horizontally scrollable event cards with RSVP CTA
- `AIInsightCard` — proactive maintenance suggestion from AI (dismissible)
- `EmergencyContactStrip` — sticky bottom bar: Security Desk · Ambulance · Fire · Society Helpline
- `NotificationBell` — top-right icon with unread count badge, opens notification drawer
- `DueReminderBanner` — shows if pending dues exist, links to payments

---

### Services (`/app/(resident)/services/`)

| Route | Page | Key Components |
|-------|------|---------------|
| `/services` | Service Catalogue | `CategoryTabs`, `ServiceCard` grid, `SearchBar` (Postgres search for MVP; 🔮 *Post-MVP* Meilisearch), `FilterDrawer` (subCategory, price, availability) |
| `/services/[id]` | Service Detail | `ServiceDetailHeader`, `WorkerList` with reputation scores, `TimeSlotPicker`, `BookingCTA` |
| `/services/[id]/book` | Booking Form | `TimeSlotPicker` (calendar), `NotesInput`, `BookingSummary`, `ConfirmButton` |

**Key Components:**
- `ServiceCard` — thumbnail, name, category badge, price, avg rating, SLA badge
- `WorkerCard` — avatar, name, rating stars, reputation score bar, job count, verified badge
- `TimeSlotPicker` — calendar grid showing available slots; unavailable slots greyed out
- `CategoryTabs` — horizontal tabs: Maintenance · Amenities · Community; sub-tabs below

---

### Bookings (`/app/(resident)/bookings/`)

| Route | Page | Key Components |
|-------|------|---------------|
| `/bookings` | My Bookings | `BookingStatusTabs` (All/Active/Past), `BookingCard` list |
| `/bookings/[id]` | Booking Detail | `BookingTimeline`, `WorkerInfoCard`, `LiveTrackingMap`, `RatingModal`, `RescheduleButton` |

**Key Components:**
- `BookingCard` — service name, worker avatar, date/time, status chip, quick actions
- `BookingTimeline` — vertical stepper: Pending → Confirmed → En Route → In Progress → Completed
- `LiveTrackingMap` — Google Maps embed with worker real-time marker (Socket.io `worker:location-update`)
- `RatingModal` — 5-star selector + optional comment textarea + submit
- `StatusChip` — colour-coded: grey/blue/yellow/green/red per booking status

---

### Grievances (`/app/(resident)/grievances/`)

| Route | Page | Key Components |
|-------|------|---------------|
| `/grievances` | My Complaints | `GrievanceList`, `StatusFilterTabs`, `NewGrievanceButton` |
| `/grievances/new` | File Complaint | `ComplaintTypeSelector`, `DescriptionTextarea`, `MediaUploadZone`, `AnonymousToggle` |
| `/grievances/[id]` | Complaint Detail | `TicketHeader` (ID + status), `StatusTimeline`, `MediaGallery`, `ResolutionNote` |

**Key Components:**
- `ComplaintTypeSelector` — card grid: Worker · Neighbour · Management · Infrastructure
- `MediaUploadZone` — drag-and-drop + mobile camera; previews grid; max 5 files
- `StatusBadge` — OPEN (red), IN_REVIEW (amber), RESOLVED (green), CLOSED (grey)

---

### Visitors (`/app/(resident)/visitors/`)

| Route | Page | Key Components |
|-------|------|---------------|
| `/visitors` | Visitor Management | `TabView`: Pre-Approved / Walk-in Approvals / Whitelist |
| `/visitors/pre-approve` | Create Invitation | `VisitorForm`, `ValidityWindowPicker`, `QRPreview`, `ShareButtons` (WhatsApp/SMS) |
| `/visitors/whitelist` | Manage Regular Staff | `WhitelistCard`, `AddStaffModal`, `RecurringPassConfig` |

**Key Components:**
- `ApprovalRequestCard` — visitor photo, name, time, resident unit, `Approve` (green) / `Deny` (red) buttons with confirmation; real-time via Socket.io
- `QRPreview` — generated QR code image with download + share options
- `WhitelistCard` — staff photo, name, pass validity, active toggle

---

### Events (`/app/(resident)/events/`)

| Route | Page | Key Components |
|-------|------|---------------|
| `/events` | Events Board | `EventCard` grid with upcoming/past tabs, `CalendarToggle` |
| `/events/[id]` | Event Detail | `EventBanner`, `RSVPForm`, `AttendeeCount`, `AddToCalendarButton`, `PhotoAlbum` |

---

### Forum (`/app/(resident)/forum/`)

| Route | Page | Key Components |
|-------|------|---------------|
| `/forum` | Forum Home | `CategoryFilterBar`, `ThreadList`, `NewThreadButton` |
| `/forum/[id]` | Thread Detail | `ThreadPost`, `ReplyList`, `ReplyComposer`, `PollWidget`, `FlagButton` |

---

### Marketplace (`/app/(resident)/marketplace/`)

> 🔮 *Post-MVP* — deferred until the core service/booking/visitor loop is live.

| Route | Page | Key Components |
|-------|------|---------------|
| `/marketplace` | Browse Listings | `CategoryTabs` (Services/Sell/Rent/Bulk), `ListingCard` grid, `SearchBar`, `PriceFilter` |
| `/marketplace/[id]` | Listing Detail | `ListingHeader`, `SellerProfileCard`, `ContactSellerButton`, `RatingStars` |
| `/marketplace/my-listings` | My Listings | `MyListingCard`, `EditButton`, `StatusChip` (pending/approved/active) |
| `/marketplace/new` | Create Listing | `CategorySelector`, `TitleInput`, `DescriptionTextarea`, `PriceInput`, `PhotoUpload` |

---

### Payments (`/app/(resident)/payments/`)

| Route | Page | Key Components |
|-------|------|---------------|
| `/payments` | Dues & History | `DuesSummaryCard`, `ItemisedBillTable`, `PayNowButton`, `PaymentHistoryTable` |
| `/payments/checkout` | Payment Checkout | `AmountBreakdown`, `RazorpayButton`, `PaymentMethodIcons` |
| `/payments/invoices` | Invoice List | `InvoiceRow` with download PDF button |
| `/payments/auto-debit` | Mandate Setup | `AutoDebitCard`, `SetupMandateButton`, `CancelMandateButton` |

---

### Notifications (`/app/(resident)/notifications/`)

- `NotificationsPage` — categorised tabs (All / Service / Visitor / Payments / Emergency)
- `NotificationRow` — icon, title, description, timestamp, unread dot
- `NotificationPreferencesPage` — per-category toggle switches

---

### Announcements & Documents (`/app/(resident)/announcements/`, `/documents/`)

- `AnnouncementsPage` — list with `AnnouncementCard` (title, date, audience badge, attachment indicator)
- `AnnouncementDetailPage` — rich-text render, PDF/image attachments, read-receipt confirm button
- `DocumentsPage` — categorised list with download button; categories: Bye-laws, Meeting Minutes, Accounts, Forms

---

## 3. Admin Web Portal — Pages & Components

### Admin Authentication
- Same OTP flow as resident portal but checks `role ∈ [SOCIETY_ADMIN, DEPT_HEAD, SUPER_ADMIN]`
- Dark theme: navy `#1A3C5E` sidebar + teal accents

---

### Admin Dashboard (`/admin/dashboard`)

**Components:**
- `SummaryCardGrid` — 4 cards: Open Requests · Pending Grievances · Today's Visitors · Dues Collected
- `ActivityFeed` — real-time stream of latest bookings, registrations, flagged complaints
- `RequestVolumeChart` — Recharts `AreaChart` — 30-day booking volume by category
- `CollectionEfficiencyGauge` — circular gauge: collected vs outstanding
- `WorkerAvailabilityHeatmap` — D3.js grid: workers × time slots (red=busy, green=free)
- `ResidentSatisfactionScore` — NPS gauge + average rating trend
- `AIAnomalyAlerts` — alert cards for complaint spikes, declining worker ratings, overdue invoices

---

### Resident Management (`/admin/residents`)

| Route | Page | Components |
|-------|------|------------|
| `/admin/residents` | Residents Table | `TanStackTable` with columns: Name, Unit, Role, Status, Payment status; `BulkImportButton` |
| `/admin/residents/new` | Add Resident | Form: name, phone, email, unit select, role |
| `/admin/residents/[id]` | Resident Profile | `ResidentProfileCard`, `PaymentHistoryTable`, `BookingHistoryTable`, `VehicleList`, `SuspendButton` |

**Key Components:**
- `BulkImportModal` — drag CSV file → preview parsed table → confirm import → show result summary
- `ResidentStatusBadge` — Active (green) / Suspended (red) / Pending (amber)
- `OwnershipTransferModal` — current occupant form → new occupant invite

---

### Unit Management (`/admin/units`)

- `UnitsTable` — TanStack table: Block, Floor, Unit No., Type, Owner, Tenant, Dues Status
- `UnitFormModal` — create/edit unit; block + floor + unit number + type fields
- `UnitDetailDrawer` — side panel showing linked resident, vehicle, payment history

---

### Service & Worker Management (`/admin/services`, `/admin/workers`)

**Services:**
- `ServicesTable` — name, category, price, SLA, active toggle
- `ServiceFormModal` — all service fields, category dropdown, estimated duration picker
- `CategoryManager` — manage category and subcategory labels

**Workers:**
- `WorkersTable` — name, skills, reputation score bar, current jobs, verified badge
- `WorkerFormModal` — create/edit worker with photo upload, skills multi-select
- `WorkerScheduleCalendar` — FullCalendar view with availability slots and assigned bookings
- `WorkerPerformanceDashboard` — ratings trend chart, SLA compliance %, complaint count
- `VerifyWorkerModal` — MVP: manual "mark as verified" toggle. 🔮 *Post-MVP:* trigger KYC flow via Digio/Signzy integration

---

### Booking Management (`/admin/bookings`)

- `AdminBookingsTable` — filterable by status, category, worker, date range; bulk export
- `BookingDetailPanel` — booking info, current status, manual worker assignment dropdown, status updater
- `ManualAssignModal` — shows ranked workers (AI score), select + assign

---

### Grievance Management (`/admin/grievances`)

- `GrievancesTable` — columns: ticket ID, type, priority, status, assigned, SLA countdown
- `PriorityBadge` — colour-coded: Low (grey), Medium (blue), High (orange), Critical (red)
- `GrievanceDetailDrawer` — full complaint, media gallery, resident details, internal notes editor, status updater, resolution form
- `SLACountdownTimer` — counts down from SLA deadline; turns red when < 2 hours
- `GrievanceAnalyticsPanel` — bar chart: common issues; line chart: avg resolution time trend

---

### Visitor & Gate Admin (`/admin/visitors`)

- `VisitorLogTable` — all entries: name, unit, entry time, exit time, status, photo thumbnail
- `BlacklistManagementPage` — table + add to blacklist modal
- `ExportVisitorLogButton` — downloads CSV for selected date range
- `GateSettingsPanel` — toggle gate module on/off, configure delivery partner bypass rules

---

### Gate Console (`/admin/gate`) — MVP stand-in for `guard-app`

A simplified, `GUARD`-role-only route inside `admin-web`, meant to be opened full-screen on a tablet/browser at the gate desk — same purpose as the deferred `guard-app`, same `visitors`/`gate` API endpoints, just a web client instead of a native app.

| Route | Page | Key Components |
|-------|------|-----------------|
| `/admin/gate` | Today's visitor log + actions | `TodaysVisitorLogList`, `LogWalkInButton`, `ScanQRButton` |
| `/admin/gate/scan` | QR scan | `QRScannerInput` (camera via browser `getUserMedia`, or manual token entry fallback), `ScanResultModal` |
| `/admin/gate/walkin` | Log walk-in | `WalkInForm` (name, photo upload via browser camera/file input, vehicle number, unit selector) |

**Key Components:**
- `TodaysVisitorLogList` — reuses the same list item design as `VisitorLogTable` but touch/large-tap-target friendly
- `BlacklistAlertBanner` — full-screen red alert on blacklist hit, mirrors `BlacklistAlertScreen` from the deferred guard-app spec

---

### Events (`/admin/events`)

- `EventsCalendar` — FullCalendar monthly view with events as blocks
- `EventFormModal` — rich-text editor (TipTap), date/time picker, RSVP toggle, push notification toggle
- `EventDetailPage` — RSVP attendee table, headcount, expense log, photo album upload

---

### Billing & Finance (`/admin/billing`)

| Page | Components |
|------|------------|
| Billing Config | `UnitTypeRateTable`, `LeviesManager`, `BillingCyclePicker`, `SaveConfigButton` |
| Invoice Management | `InvoicesTable`, `GenerateInvoicesButton`, `StatusFilter` |
| Payments Summary | `CollectionSummaryChart`, `DefaultersList`, `ReconciliationTable` |
| Expenses | `ExpensesTable` with category tags, `AddExpenseModal` with receipt upload |
| Reminders | `ReminderSequenceConfig` — set day intervals for automated reminder blasts |

---

### Announcements (`/admin/announcements`)

- `AnnouncementsTable` — title, audience, scheduled date, read-receipt %, status
- `AnnouncementComposer` — TipTap rich-text editor + PDF/image attachment upload + audience selector (all/block/owner/tenant) + schedule datetime picker + critical toggle
- `ReadReceiptModal` — table of residents: read / unread status per critical circular

---

### Marketplace Moderation (`/admin/marketplace`)

> 🔮 *Post-MVP*

- `PendingListingsTable` — submitted listings awaiting approval
- `ListingReviewModal` — preview listing, approve/reject with reason
- `AllListingsTable` — full listings with status filter, deactivate button

---

### Analytics & Reports (`/admin/analytics`)

| Section | Charts / Components |
|---------|---------------------|
| Operations | `ServiceVolumeAreaChart`, `SLACompliancePieChart`, `WorkerUtilisationBarChart` |
| Financial | `CollectionTrendLineChart`, `ExpenseBreakdownPieChart`, `PnLSummaryTable` |
| Community | `EventAttendanceTrendChart`, `ForumActivityHeatmap`, `AppAdoptionGauge` |
| Security | `VisitorVolumeBarChart`, `PeakEntryTimeHeatmap`, `BlacklistIncidentList` |
| Satisfaction | `NPSScoreGauge`, `RatingDistributionHistogram`, `ResolutionSatisfactionTrend` |
| AI Insights | `PredictiveMaintAlert` cards, `WorkerOutlierList`, `SeasonalDemandForecastChart` |
| Export | `ExportReportButton` — triggers PDF/Excel generation and downloads |

---

### Settings (`/admin/settings`)

- `SocietyProfileForm` — name, address, logo upload, gate module toggle
- `DepartmentsManager` — CRUD for departments with contact info
- `RolesPermissionsView` — read-only permission matrix table (5 roles × all actions)
- `AuditLogTable` — filterable by actor, action, date range
- `IntegrationsPage` — Razorpay key config, MSG91 config, FCM config status

---

## 4. Mobile App (React Native + Expo)

> 🔮 *Post-MVP* — deferred until `resident-web`/`admin-web` and `services/api` are proven. Everything below is the long-term plan.

### App Structure — `apps/mobile-app/` (Expo Router)

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   └── otp.tsx
│
└── (tabs)/                      # Bottom tab navigator
    ├── index.tsx                # Dashboard
    ├── services.tsx             # Service catalogue
    ├── visitors.tsx             # Visitor management
    ├── payments.tsx             # Dues & payments
    └── more.tsx                 # Notifications, forum, marketplace, etc.

screens/                         # Full screens outside tab nav
├── services/[id].tsx
├── bookings/[id].tsx
├── grievances/new.tsx
├── grievances/[id].tsx
├── visitors/pre-approve.tsx
└── emergency/sos.tsx
```

### Guard Sub-App — `apps/guard-app/` (Separate Expo App)

> 🔮 *Post-MVP* — MVP uses the "Gate Console" page in `admin-web` (see §3) instead, exposed to the same `GUARD` role, same `visitors`/`gate` API endpoints.

The guard sub-app is a **completely separate Expo project** with its own `app.json`, bundle ID, and EAS build config. It is a simplified, purpose-built app for security staff — no resident features at all.

```
apps/guard-app/
├── app/
│   ├── (auth)/
│   │   └── login.tsx            # Guard credentials login
│   └── (gate)/
│       ├── index.tsx            # Today's visitor log list
│       ├── scan.tsx             # Full-screen QR scanner
│       └── walkin.tsx           # Log walk-in: camera + name + vehicle
├── components/
│   ├── VisitorLogCard.tsx
│   ├── ScanResultModal.tsx
│   └── BlacklistAlertScreen.tsx
├── navigation/
├── api/
└── store/
```

**Why separate?** Guards should not see resident data. A separate app means a separate bundle, separate auth flow, and a UI optimised for one-handed gate operation on a cheap Android device.

### Screen Inventory

**Auth Screens:**
- `LoginScreen` — phone input + country code selector
- `OTPScreen` — 6-cell OTP input with auto-submit + resend timer
- `RegisterScreen` — society code input (live validation), name, unit selector

**Resident Tab Screens:**
- `DashboardScreen` — same layout as web dashboard, adapted for mobile; pull-to-refresh
- `ServiceCatalogueScreen` — category scroll + service cards; bottom sheet for filters
- `ServiceDetailScreen` — worker list, slot picker, book CTA
- `BookingsScreen` — tab-view active/past bookings
- `BookingDetailScreen` — timeline + live map (react-native-maps) + rate modal
- `VisitorsScreen` — approval requests as cards with swipe-to-approve
- `PreApproveScreen` — form + QR code generated + share sheet
- `PaymentsScreen` — dues card + Razorpay checkout via WebView or SDK
- `NotificationsScreen` — categorised list
- `GrievancesScreen` — list + FAB to file new
- `NewGrievanceScreen` — complaint type + description + Expo Camera upload
- `ForumScreen` — threads list + compose FAB
- `MarketplaceScreen` — listings grid + listing create
- `EmergencySOSScreen` — large red SOS button; triggers GPS broadcast
- `DirectoryScreen` — society departments + opt-in resident contact list
- `DocumentsScreen` — downloadable files list

**Guard Sub-App Screens (`apps/guard-app/`):**
- `GateScreen` — visitor log list (current day), scan QR button, log walk-in button
- `ScanScreen` — Expo Barcode Scanner; full-screen camera view; on scan shows visitor info + approve/reject
- `WalkInScreen` — visitor name, Expo Camera for photo, vehicle number input, unit number input; sends to resident for approval
- `BlacklistAlertScreen` — shown when a blacklisted QR is scanned

### Mobile-Specific Features

| Feature | Implementation |
|---------|---------------|
| Push Notifications | Expo Notifications + Firebase FCM; request permission on onboarding |
| Biometric Lock | Expo LocalAuthentication; optional app lock after background |
| Offline Support | WatermelonDB SQLite cache for bookings, notifications, directory; sync on reconnect |
| QR Scanner | Expo Camera + BarCodeScanner for gate screen |
| Camera Upload | Expo ImagePicker with compression before upload |
| Deep Links | Expo Linking: `beaverr://booking/[id]`, `beaverr://visitor/approve/[id]` |
| Live Map | react-native-maps with worker location marker updated via Socket.io |
| Calendar Export | Expo Calendar API: add event to phone calendar from event detail |

---

## 5. Shared Packages (`packages/`)

```
packages/
├── ui/                    # Shared React components used by both web portals
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── index.ts
├── types/                 # Shared TypeScript types (used by all apps + API)
│   ├── user.types.ts
│   ├── service.types.ts
│   ├── booking.types.ts
│   └── index.ts
├── api-client/            # Shared Axios instance + TanStack Query hooks
│   └── index.ts
└── config/                # Shared tooling configs
    ├── eslint-config/
    └── tsconfig/
        ├── base.json
        ├── nextjs.json
        └── react-native.json
```

---

## 6. Shared State Management

### Zustand Stores

```typescript
// authStore.ts
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  societyId: string | null;
  isAuthenticated: boolean;
  login: (tokens) => void;
  logout: () => void;
  updateProfile: (user) => void;
}

// notificationStore.ts
interface NotificationStore {
  unreadCount: number;
  notifications: Notification[];
  addNotification: (n) => void;
  markRead: (id) => void;
  markAllRead: () => void;
}

// socketStore.ts
interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token) => void;
  disconnect: () => void;
}

// visitorStore.ts
interface VisitorStore {
  pendingApprovals: Visitor[];
  addPendingApproval: (v) => void;
  resolveApproval: (id, decision) => void;
}

// emergencyStore.ts
interface EmergencyStore {
  activeSOS: SOSEvent | null;
  activeEmergencyBroadcast: EmergencyBroadcast | null;
  triggerSOS: (coords) => void;
  clearSOS: () => void;
}
```

---

## 7. API Layer (TanStack Query + Axios)

### Axios Instance

```typescript
// lib/apiClient.ts
const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

// Request interceptor: attach access token
apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
apiClient.interceptors.response.use(null, async error => {
  if (error.response?.status === 401) {
    await refreshToken();
    return apiClient.request(error.config);
  }
  return Promise.reject(error);
});
```

### TanStack Query Hooks (examples)

```typescript
// hooks/useServices.ts
export const useServices = (filters) =>
  useQuery({ queryKey: ['services', filters], queryFn: () => apiClient.get('/services', { params: filters }) });

// hooks/useBookings.ts
export const useCreateBooking = () =>
  useMutation({ mutationFn: (data) => apiClient.post('/bookings', data),
    onSuccess: () => queryClient.invalidateQueries(['bookings']) });

// hooks/useVisitorApproval.ts
export const useApproveVisitor = () =>
  useMutation({ mutationFn: (id) => apiClient.patch(`/gate/visitors/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries(['visitors']) });
```

### Query Key Convention
```
['services']                       — all services
['services', { category: 'MAINTENANCE' }]
['bookings', userId]
['bookings', bookingId]
['grievances', userId]
['visitors', userId, 'pending']
['notifications', userId]
['payments', userId, 'dues']
['analytics', 'dashboard']
```

---

## 8. Real-Time (Socket.io Client)

### Connection Setup

```typescript
// lib/socket.ts
export const createSocket = (token: string) =>
  io(process.env.NEXT_PUBLIC_WS_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });
```

### Event Listeners (setup in layout/provider)

```typescript
socket.on('visitor:approval-request', (visitor) => {
  useVisitorStore.getState().addPendingApproval(visitor);
  useNotificationStore.getState().addNotification({ type: 'VISITOR', ...visitor });
  toast({ title: 'Visitor at gate', description: visitor.name });  // toast popup
});

socket.on('booking:worker-assigned', (data) => {
  queryClient.invalidateQueries(['bookings', data.bookingId]);
  showPushBanner('Worker assigned', data.workerName);
});

socket.on('worker:location-update', (data) => {
  // Update map marker in BookingDetailPage
  useBookingLocationStore.getState().updateWorkerLocation(data.bookingId, data.coords);
});

socket.on('emergency:broadcast', (broadcast) => {
  // Full-screen emergency modal — cannot be dismissed for 10 seconds
  useEmergencyStore.getState().setActiveBroadcast(broadcast);
});

socket.on('payment:received', (payment) => {
  queryClient.invalidateQueries(['payments']);
  toast.success(`Payment of ₹${payment.amount} received!`);
});
```

---

## 9. Authentication Flow

### Web (Next.js)

1. User enters phone → `POST /api/auth/send-otp` → loading state
2. OTP input screen (6 cells, auto-focus next on input, auto-submit on 6th digit)
3. `POST /api/auth/verify-otp` → receives `{ accessToken, user }`
4. Store `accessToken` in Zustand; refresh token set as HttpOnly cookie by server
5. Next.js middleware (`middleware.ts`) checks `accessToken` on every protected route; redirects to `/login` if absent
6. Auto-refresh: Axios interceptor catches 401 → `POST /api/auth/refresh` → new access token → retry original request

### Route Protection (Next.js Middleware)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // Role check for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const decoded = verifyToken(token);
    if (!['SOCIETY_ADMIN','DEPT_HEAD','SUPER_ADMIN'].includes(decoded?.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
}
```

---

## 10. Forms (React Hook Form + Zod)

### Example: New Grievance Form

```typescript
const grievanceSchema = z.object({
  type: z.enum(['WORKER', 'NEIGHBOUR', 'MANAGEMENT', 'INFRASTRUCTURE']),
  description: z.string().min(20, 'Please describe the issue in detail (min 20 chars)'),
  mediaFiles: z.array(z.instanceof(File)).max(5).optional(),
  isAnonymous: z.boolean().default(false),
  againstUserId: z.string().optional(),
});

const { register, handleSubmit, watch, formState: { errors } } = useForm({
  resolver: zodResolver(grievanceSchema),
});
```

### Form Patterns Used
- All forms use `React Hook Form` with `zodResolver`
- `<FormField>` shadcn/ui wrapper provides consistent label + error message layout
- Multi-step forms (e.g., registration, booking) use `useStep` hook with Zustand state persistence
- File upload fields use custom `<FileUploadZone>` component with drag-and-drop and preview grid

---

## 11. Payments (Razorpay)

### Web Integration

```typescript
// components/RazorpayButton.tsx
const handlePayment = async () => {
  const { data } = await apiClient.post('/payments/initiate', { amount, type });
  const rzp = new window.Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
    order_id: data.orderId,
    amount: data.amount,
    name: 'Beaverr',
    description: 'Society Maintenance Dues',
    handler: async (response) => {
      await apiClient.post('/payments/verify', response);
      queryClient.invalidateQueries(['payments']);
      toast.success('Payment successful!');
    },
    prefill: { contact: user.phone },
    theme: { color: '#0F7173' },
  });
  rzp.open();
};
```

### Mobile Integration
- Use Razorpay React Native SDK or WebView-based checkout
- Deep link back to app after payment completion: `beaverr://payment/success`

---

## 12. File Uploads

### Upload Pattern (Web)

```typescript
// lib/uploadFile.ts
export const uploadFile = async (file: File, folder: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const { data } = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
  });
  return data.url;  // S3/R2 URL
};
```

### Upload Components
- `<FileUploadZone>` — drag-and-drop area + click to browse; shows file previews; validates type + size client-side before upload
- `<AvatarUpload>` — circular crop with react-image-crop before upload
- `<DocumentUpload>` — PDF only, shows filename + size + remove button

---

## 13. Design System & Theming

> **Primary design direction:** a high-end, agency-grade visual style drives `resident-web`/`admin-web` implementation. Beaverr's brand colours below feed the visual direction (closest fit: **Soft Structuralism** for `resident-web` — silver-grey/white, airy — or **Ethereal Glass** for `admin-web`'s dark theme), which then drives concrete typography, card structure (Double-Bezel nested cards), spacing, and motion choreography. Brand colours, tone of voice, and the beaver identity stay Beaverr-specific "flavor" layered on top.
>
> **One practical guardrail on dense screens:** heavy `backdrop-blur`/motion effects are tuned for marketing pages. Apply them to nav, modals, and hero/dashboard-summary areas; keep `TanStack Table` data grids (residents, bookings, visitor logs, grievances) and the Gate Console legible and fast first — motion and blur there should be minimal, since these are the screens used many times a day, including by less tech-savvy residents and guards on lower-end devices.

### Colour Tokens

```css
/* globals.css / tailwind.config.ts */
--primary: #1A3C5E;       /* Deep Navy */
--accent: #0F7173;        /* Teal */
--warm: #F4A261;          /* Amber */
--success: #22C55E;
--warning: #F59E0B;
--destructive: #EF4444;
--muted: #94A3B8;
--background: #F8FAFC;    /* Resident portal */
--admin-bg: #0F172A;      /* Admin portal dark background */
```

### Typography
- Headings: `Plus Jakarta Sans` (400/600/700)
- Body: `Geist` (400/500) — chosen over Inter/Roboto/Arial/Open Sans/Helvetica, which read as generic defaults
- Monospace (ticket IDs, codes): `JetBrains Mono`

### Core Shared Components (packages/ui)

| Component | Description |
|-----------|-------------|
| `<StatusChip>` | Colour-coded status label with dot indicator |
| `<RepScoreBar>` | Horizontal progress bar 0–100 for worker reputation |
| `<StarRating>` | 5-star interactive or display-only rating |
| `<Avatar>` | Circular image with initials fallback |
| `<EmptyState>` | Illustration + message for empty lists |
| `<LoadingSkeleton>` | Shimmer placeholder for loading states |
| `<ConfirmDialog>` | shadcn AlertDialog wrapper with confirm/cancel |
| `<PageHeader>` | Title + breadcrumb + optional action button |
| `<DataTable>` | TanStack Table wrapper with pagination + sorting |
| `<MobileBottomSheet>` | iOS/Android-style slide-up panel for filters |
| `<NotificationBadge>` | Red dot with count, overlaid on icon |
| `<SOSButton>` | Large red pulsing button, requires hold-to-confirm |

### Admin Dark Theme Overrides
```typescript
// admin-web/tailwind.config.ts
theme: {
  extend: {
    colors: {
      sidebar: '#0F172A',
      'sidebar-active': '#1A3C5E',
      'card-bg': '#1E293B',
    }
  }
}
```

### Responsive Breakpoints
- Mobile: `< 640px` (primary for resident web PWA)
- Tablet: `640px – 1024px`
- Desktop: `> 1024px` (primary for admin portal)

Admin portal is desktop-first; resident web portal is mobile-first with PWA install support via `next-pwa`.

---

## 14. Error Handling (Frontend)

All API errors follow the standard format defined in the backend. The frontend handles them in one place.

### Global Error Handler in Axios Interceptor

```typescript
// lib/api.ts — response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { code, message } = error.response?.data?.error ?? {};

    switch (code) {
      case 'TOKEN_EXPIRED':
        await refreshToken();
        return apiClient.request(error.config); // retry
      case 'UNAUTHENTICATED':
        useAuthStore.getState().logout();
        router.push('/login');
        break;
      case 'RATE_LIMITED':
      case 'OTP_RATE_LIMITED':
        toast.error(message, { description: 'Please wait before trying again.' });
        break;
      case 'FEATURE_DISABLED':
        toast.error('This feature is not available for your society.');
        break;
      default:
        // Let component-level catch handle it, or show generic toast
        break;
    }
    return Promise.reject(error);
  }
);
```

### Component-Level Error Handling Pattern

```typescript
// In mutation handlers
const { mutate: createBooking, isPending, isError, error } = useCreateBooking();

const handleSubmit = () => {
  createBooking(formData, {
    onError: (err) => {
      const code = err.response?.data?.error?.code;
      if (code === 'SLOT_ALREADY_BOOKED') {
        setSlotError('This slot was just taken. Please choose another time.');
      } else if (code === 'WORKER_NOT_AVAILABLE') {
        setSlotError('No workers available. Your request will be assigned manually.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  });
};
```

### Error UI Components

| Component | Usage |
|-----------|-------|
| `<InlineFieldError>` | Below form fields for validation errors (`VALIDATION_ERROR`) |
| `<SlotUnavailableAlert>` | On booking form for `SLOT_ALREADY_BOOKED` |
| `<FeatureDisabledPlaceholder>` | When feature flag is off — shows "coming soon" card |
| `<ApiErrorBoundary>` | React Error Boundary wrapping data-heavy pages |
| `toast.error()` | Generic API errors not tied to a specific field |

---

## 15. Feature Flags (Frontend)

Feature flags are returned in `GET /api/auth/me` as part of the user/society object. They control what UI is rendered.

### Storing Flags

```typescript
// authStore.ts — included in auth response
interface AuthStore {
  features: {
    FEATURE_VISITOR_MANAGEMENT: boolean;
    FEATURE_MARKETPLACE: boolean;
    FEATURE_AI_PREDICTIONS: boolean;
    FEATURE_PAYMENTS: boolean;
    FEATURE_FORUM: boolean;
    FEATURE_EMERGENCY_SOS: boolean;
    FEATURE_EVENTS: boolean;
    FEATURE_DOCUMENTS: boolean;
  };
}
```

### Using Flags in Components

```typescript
// Sidebar nav item — only show if enabled
const { features } = useAuthStore();

{features.FEATURE_MARKETPLACE && (
  <NavItem href="/marketplace" icon={<ShoppingBag />} label="Marketplace" />
)}

{features.FEATURE_VISITOR_MANAGEMENT && (
  <NavItem href="/visitors" icon={<UserCheck />} label="Visitors" />
)}

// Quick actions bar on dashboard
{features.FEATURE_EMERGENCY_SOS && (
  <QuickAction icon={<AlertTriangle />} label="SOS" href="/emergency" variant="destructive" />
)}
```

### Feature-Disabled Placeholder Component

```typescript
// components/shared/FeatureDisabledPlaceholder.tsx
export const FeatureDisabledPlaceholder = ({ featureName }: { featureName: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
    <Lock className="h-12 w-12 mb-4" />
    <h3 className="text-lg font-medium">{ featureName } is not enabled</h3>
    <p className="text-sm">Contact your society admin to enable this feature.</p>
  </div>
);
```

---

## 16. Observability (Frontend)

### Sentry Integration

```typescript
// app/layout.tsx (Next.js root)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Attach user context on every error
  beforeSend(event) {
    const { user } = useAuthStore.getState();
    if (user) event.user = { id: user.id, email: user.email };
    return event;
  }
});
```

### Performance Monitoring

- `next/analytics` — Core Web Vitals (LCP, FID, CLS) tracked per page
- TanStack Query `staleTime` and `cacheTime` tuned per endpoint to reduce redundant fetches
- Socket.io reconnection events logged to Sentry as breadcrumbs

### Mobile (Expo) Observability

- Sentry React Native SDK — catches JS crashes + native crashes
- Expo Updates `EAS` — track which app version is in use per user
- `console.error` overridden in production to forward to Sentry

---

## Environment Variables

```env
# Resident Web
NEXT_PUBLIC_API_URL=https://api.beaverr.in
NEXT_PUBLIC_WS_URL=wss://api.beaverr.in
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
NEXT_PUBLIC_MEILISEARCH_HOST=...
NEXT_PUBLIC_MEILISEARCH_KEY=...

# Mobile (app.config.ts)
EXPO_PUBLIC_API_URL=https://api.beaverr.in
EXPO_PUBLIC_WS_URL=wss://api.beaverr.in
EXPO_PUBLIC_RAZORPAY_KEY=rzp_live_...
GOOGLE_SERVICES_JSON=./google-services.json     # Android FCM
GOOGLE_SERVICE_INFO_PLIST=./GoogleService-Info.plist  # iOS FCM
```

---

*Beaverr Frontend — v1.0 | 2025*
