# Clerkflow — Claude Code Context

## What Clerkflow is

Clerkflow is a B2G SaaS "clerk operating system" for US municipal clerks in towns under 5,000 population. It replaces spreadsheets, inbox chaos, and scattered point tools with one login for town staff and one public hub for residents. Core modules: Meetings, FOIA/public records, Forms & licenses, Boards/commissions, Resident requests.

**Positioning:** Trustworthy small-government software — calm, professional, accessible.  
**Tagline:** "The clerk operating system for towns under 5,000."  
**Pricing:** $99–149/month per town (under municipal procurement thresholds)  
**Domain:** clerkflow.software | Resident hubs: `[town-slug].clerkflow.software`  
**Reference town for dev/testing:** Riverside, OH — pop. 1,200

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Language:** TypeScript
- **Auth:** Clerk (staff login; resident hub is mostly unauthenticated)
- **Database:** (define per project — Postgres recommended)
- **Hosting:** Vercel

---

## Route Structure

### Marketing (public)
```
/                  → Homepage
/product           → Module overview
/for-small-towns   → Why Clerkflow for <5k towns
/pricing           → Pricing page
/about             → About
/contact           → Contact
/privacy           → Privacy policy
/terms             → Terms of service
```

### Clerk App (authenticated staff)
```
/app               → Command Center dashboard
/app/meetings      → Meetings list
/app/meetings/[id] → Meeting detail (tabs: Agenda | Minutes | Action Items | Publish)
/app/foia          → FOIA queue
/app/foia/[id]     → FOIA request detail
/app/services      → Forms & licenses
/app/services/[id] → Submission detail
/app/boards        → Boards & commissions roster
/app/residents     → Resident registry
/app/publish       → What's live on public hub
/app/settings      → Settings (Town profile | Users & roles | Billing | Compliance)
/app/reports       → Reports
```

### Resident Hub (public, per-town subdomain)
```
/                  → Town home (action cards)
/meetings          → Published agendas & minutes archive
/foia              → Submit a FOIA request
/apply             → Apply for license/permit
/track             → Track my request (by confirmation number)
/pay               → Pay a fee
/search            → Search town records
```

### Internal (founder-only)
```
/internal          → Prospects table
/internal/[id]     → Prospect detail
```

---

## Core Data Models

### FOIARequest
```ts
{
  id: string
  requestNumber: string          // e.g. "FOIA-2024-1042"
  requesterName: string
  requesterEmail: string
  description: string
  receivedAt: Date
  responseDueAt: Date            // statutory deadline
  status: FOIAStatus
  assignedTo?: string
  documents: Document[]
  correspondence: Message[]
  townId: string
}

type FOIAStatus = "new" | "in_progress" | "due_soon" | "overdue" | "complete" | "denied"
```

### Meeting
```ts
{
  id: string
  townId: string
  title: string                  // e.g. "Town Council — Regular Meeting"
  type: MeetingType
  scheduledAt: Date
  location: string
  status: MeetingStatus
  agenda?: Document
  minutes?: Document
  actionItems: ActionItem[]
  publishedAt?: Date
}

type MeetingType = "council" | "planning" | "zoning" | "board" | "special" | "workshop"
type MeetingStatus = "draft" | "published" | "cancelled"
```

### License / ServiceSubmission
```ts
{
  id: string
  townId: string
  type: string                   // e.g. "business_license", "burn_permit"
  applicantName: string
  applicantEmail: string
  submittedAt: Date
  expiresAt?: Date
  status: "pending" | "approved" | "denied" | "expired"
  formData: Record<string, unknown>
  fee?: number
  feePaidAt?: Date
}
```

### BoardMember
```ts
{
  id: string
  townId: string
  boardName: string              // e.g. "Planning Commission"
  memberName: string
  role: string                   // e.g. "Chair", "Member"
  termStartAt: Date
  termEndAt: Date
  contactEmail?: string
}
```

### ResidentRequest
```ts
{
  id: string
  townId: string
  confirmationNumber: string     // for public tracking (no login)
  category: string               // e.g. "pothole", "noise_complaint"
  description: string
  submittedAt: Date
  status: "open" | "in_progress" | "resolved" | "closed"
  statusHistory: StatusEvent[]
}
```

---

## Component Library

Use these names consistently across the codebase:

| Component | Purpose |
|---|---|
| `StatCard` | Dashboard metric card (label, value, status color, optional link) |
| `DeadlineBadge` | Shows deadline with color urgency (overdue/due soon/ok) |
| `StatusPill` | Inline status tag — overdue, due soon, draft, published, complete |
| `SidebarNav` | Left sidebar with nav items, collapsible on mobile |
| `PageHeader` | Page title + breadcrumb + optional action button |
| `EmptyState` | Empty list/state with icon, message, and CTA |
| `DataTable` | Sortable/filterable table with pagination |
| `DeadlineCountdown` | Prominent countdown for FOIA detail pages |
| `CorrespondenceThread` | Message thread for FOIA correspondence |
| `ActionCard` | Large tap-target card for resident hub home |
| `PublishBadge` | Draft vs Published state indicator |
| `TimelineStatus` | Vertical status timeline for resident request tracking |

---

## Design System

### Colors
```css
--color-primary:     #1e3a5f;   /* Navy — primary actions, sidebar */
--color-background:  #f8fafc;   /* Warm off-white — page background */
--color-surface:     #ffffff;   /* Card/panel backgrounds */
--color-text:        #0f172a;   /* Primary text */
--color-text-muted:  #475569;   /* Secondary text */
--color-border:      #e2e8f0;   /* Borders, dividers */

/* Status colors — always pair with text label, never color alone */
--color-success:     #16a34a;   /* Complete, published, approved */
--color-warning:     #d97706;   /* Due soon, expiring */
--color-danger:      #dc2626;   /* Overdue, denied */
--color-info:        #2563eb;   /* In progress, informational */
```

### Typography
- **Font:** Inter, system-ui, sans-serif
- **Body:** 16px minimum
- **Headings:** Confident but not loud — use font-weight, not size alone
- **Line height:** 1.5 for body, 1.2 for headings

### Do NOT use
- Purple gradients
- Glassmorphism
- Generic startup illustration packs
- Neon accents
- Dark mode (v1 is light only)

---

## Status Language

Use these exact labels everywhere — dashboard, lists, detail pages, badges:

| Status | Color | Usage |
|---|---|---|
| `Overdue` | Red `#dc2626` | FOIA past deadline |
| `Due soon` | Amber `#d97706` | FOIA due within 3 days |
| `In progress` | Blue `#2563eb` | FOIA being worked |
| `New` | Slate | Just received, unassigned |
| `Complete` | Green `#16a34a` | Fulfilled/closed |
| `Draft` | Slate | Meeting/doc not published |
| `Published` | Green | Live on resident hub |
| `Cancelled` | Red | Meeting cancelled |
| `Pending` | Amber | License awaiting review |
| `Approved` | Green | License approved |
| `Expiring soon` | Amber | Board term or license expiring |

---

## Microcopy & Tone Rules

- Plain English, professional, warm
- Sentence case for UI labels (not Title Case For Everything)
- Active voice: "Publish to resident hub" not "Deploy to citizen-facing endpoint"
- Specific over vague: "3 FOIA requests overdue" not "AI-detected compliance anomalies"
- Never use: "AI-powered", "revolutionary", "disrupt", "enterprise-grade", "leverage"
- Errors explain what happened and how to fix it
- Empty states include a CTA: "No FOIA requests yet. Share your town's public records link with residents."
- FOIA deadline banners: "Response due in 3 days — [Take action]"

---

## Clerk App Layout

```
┌─────────────────────────────────────────────┐
│ Top bar: [Town name]        [Search] [User] │
├──────────────┬──────────────────────────────┤
│ Sidebar nav  │  Main content area           │
│              │                              │
│ Command Ctr  │  PageHeader                  │
│ Meetings     │  ─────────────────────────   │
│ FOIA         │  Content / DataTable         │
│ Services     │                              │
│ Boards       │                              │
│ Residents    │                              │
│ Publish      │                              │
│              │                              │
│ ──────────── │                              │
│ Settings     │                              │
└──────────────┴──────────────────────────────┘
```

- Sidebar collapses to icon-only on tablet, bottom nav on mobile
- Clerk app requires authentication — redirect to `/login` if unauthenticated
- Resident hub has no sidebar; simple top nav only

---

## Command Center Dashboard Layout

Priority order (top to bottom):
1. **Overdue FOIA** — red alert, count + list, always at top
2. **Due this week** — FOIA + meetings combined timeline
3. **Upcoming meetings** — next 7 days
4. **Board terms expiring** — within 60 days
5. **License renewals due** — within 30 days
6. **Quick actions** — New meeting | New FOIA | Publish

---

## FOIA Workflow

Statutory deadlines vary by state — build with configurable deadline (default 5 business days).

Stages: `New → In progress → [Due soon / Overdue] → Complete | Denied`

FOIA detail page must show:
- Prominent deadline countdown banner (sticky or top of page)
- Requester info
- Original request text
- Correspondence thread (internal + external)
- Attached documents
- Status change log
- Release / fulfill / deny actions

---

## Resident Hub Rules

- No login required for: viewing meetings, submitting FOIA, tracking requests, applying
- Mobile-first — assume phone as primary device
- Large tap targets (min 44px)
- Plain language — resident may be elderly, non-technical
- Official feel — avoid anything that looks like a startup landing page
- Confirmation numbers for tracking must be simple (e.g. `REQ-2024-0042`)

---

## What NOT to Build (v1 scope)

- Full general ledger / payroll
- Police CAD
- Utility billing at scale
- Dark mode
- AI chat as primary interface (AI is assistive only: minutes drafting, resident Q&A)

---

## Key Business Context

- Target customer: town clerk, often solo, wears multiple hats
- Buying decision: clerk recommends → mayor/council approves
- Under most municipal procurement thresholds at $99–149/mo
- Competitors: spreadsheets, email, GovQA (enterprise, too expensive), CivicPlus (too complex)
- Primary sales motion: founder direct outreach to clerks
- Missed FOIA deadlines = legal liability — reliability is non-negotiable
