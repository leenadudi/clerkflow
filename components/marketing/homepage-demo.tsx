'use client'

import { useState } from 'react'
import {
  LayoutGrid,
  Archive,
  Calendar,
  ClipboardList,
  Users,
  Send,
  AlertTriangle,
  ChevronLeft,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  Circle,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Demo data ────────────────────────────────────────────────────────────────

type Status = 'overdue' | 'due-soon' | 'in-progress' | 'new' | 'complete'

type DemoRequest = {
  id: string
  requester: string
  title: string
  received: string
  deadline: string
  status: Status
  daysLeft: number
  summary: string
  thread: { author: string; role: string; time: string; body: string }[]
}

const REQUESTS: DemoRequest[] = [
  {
    id: 'FOIA-2026-1041',
    requester: 'Dana Whitfield',
    title: 'Police incident reports — Maple Street',
    received: 'Jun 2, 2026',
    deadline: 'Jun 9, 2026',
    status: 'overdue',
    daysLeft: -9,
    summary:
      'Requesting all police incident reports filed for the 400 block of Maple Street during May and June 2026.',
    thread: [
      {
        author: 'Dana Whitfield',
        role: 'Requester',
        time: 'Jun 2 · 9:14 AM',
        body: 'Requesting all police incident reports filed for the 400 block of Maple Street, May–Jun 2026.',
      },
      {
        author: 'Barbara Jensen',
        role: 'Town Clerk',
        time: 'Jun 2 · 2:40 PM',
        body: "Thank you, Dana. We've logged this as FOIA-2026-1041 and are coordinating with the Police Department.",
      },
    ],
  },
  {
    id: 'FOIA-2026-1042',
    requester: 'Tom Bradley',
    title: 'Budget documents — FY2025',
    received: 'Jun 12, 2026',
    deadline: 'Jun 19, 2026',
    status: 'due-soon',
    daysLeft: 1,
    summary:
      'Requesting all budget documents, appropriations, and financial reports for fiscal year 2025.',
    thread: [
      {
        author: 'Tom Bradley',
        role: 'Requester',
        time: 'Jun 12 · 11:02 AM',
        body: 'Requesting all FY2025 budget documents, appropriations, and financial reports.',
      },
    ],
  },
  {
    id: 'FOIA-2026-1043',
    requester: 'Sarah Chen',
    title: 'Zoning variance permits — River Rd',
    received: 'Jun 14, 2026',
    deadline: 'Jun 25, 2026',
    status: 'in-progress',
    daysLeft: 7,
    summary:
      'Requesting all zoning variance permits issued for River Road properties in 2025–2026.',
    thread: [
      {
        author: 'Sarah Chen',
        role: 'Requester',
        time: 'Jun 14 · 3:55 PM',
        body: "I'd like all zoning variance permits for River Road properties, 2025–2026.",
      },
      {
        author: 'Barbara Jensen',
        role: 'Town Clerk',
        time: 'Jun 14 · 4:30 PM',
        body: "Received. We're gathering documents from the zoning board.",
      },
    ],
  },
  {
    id: 'FOIA-2026-1040',
    requester: 'James Miller',
    title: 'Council meeting minutes — Q1 2026',
    received: 'May 20, 2026',
    deadline: 'May 27, 2026',
    status: 'complete',
    daysLeft: 0,
    summary: 'Requesting meeting minutes for all town council meetings held January–March 2026.',
    thread: [
      {
        author: 'James Miller',
        role: 'Requester',
        time: 'May 20 · 10:00 AM',
        body: 'Please provide minutes for all council meetings January–March 2026.',
      },
      {
        author: 'Barbara Jensen',
        role: 'Town Clerk',
        time: 'May 23 · 9:15 AM',
        body: 'Records released — 8 documents sent to your email.',
      },
    ],
  },
]

type DemoMeeting = {
  id: string
  title: string
  date: string
  time: string
  location: string
  displayStatus: string
  statusColor: string
}

const MEETINGS: DemoMeeting[] = [
  {
    id: 'm1',
    title: 'Town Council — Regular Meeting',
    date: 'Jun 23, 2026',
    time: '7:00 PM',
    location: 'Town Hall, Council Chambers',
    displayStatus: 'Agenda published',
    statusColor: 'text-primary bg-primary/10',
  },
  {
    id: 'm2',
    title: 'Planning Commission',
    date: 'Jun 30, 2026',
    time: '6:30 PM',
    location: 'Town Hall, Room 102',
    displayStatus: 'Draft',
    statusColor: 'text-muted-foreground bg-muted',
  },
  {
    id: 'm3',
    title: 'Town Council — Special Session',
    date: 'Jun 10, 2026',
    time: '5:00 PM',
    location: 'Town Hall, Council Chambers',
    displayStatus: 'Complete',
    statusColor: 'text-[#16a34a] bg-[#16a34a]/10',
  },
]

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<Status, string> = {
  overdue: 'Overdue',
  'due-soon': 'Due soon',
  'in-progress': 'In progress',
  new: 'New',
  complete: 'Complete',
}

const STATUS_PILL: Record<Status, string> = {
  overdue: 'bg-[#dc2626]/10 text-[#dc2626]',
  'due-soon': 'bg-[#d97706]/10 text-[#d97706]',
  'in-progress': 'bg-[#2563eb]/10 text-[#2563eb]',
  new: 'bg-muted text-muted-foreground',
  complete: 'bg-[#16a34a]/10 text-[#16a34a]',
}

function DeadlinePill({ req }: { req: DemoRequest }) {
  if (req.status === 'complete') return null
  if (req.daysLeft < 0) {
    return (
      <span className="rounded-full bg-[#dc2626]/10 px-2 py-0.5 text-[11px] font-medium text-[#dc2626]">
        {Math.abs(req.daysLeft)}d overdue
      </span>
    )
  }
  if (req.daysLeft <= 3) {
    return (
      <span className="rounded-full bg-[#d97706]/10 px-2 py-0.5 text-[11px] font-medium text-[#d97706]">
        Due in {req.daysLeft}d
      </span>
    )
  }
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {req.daysLeft}d left
    </span>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { label: 'Home', icon: LayoutGrid, view: null },
  { label: 'Meetings', icon: Calendar, view: 'meetings' as const },
  { label: 'Records Requests', icon: Archive, view: 'records' as const },
  { label: 'Permits & Licenses', icon: ClipboardList, view: null },
  { label: 'Boards', icon: Users, view: null },
  { label: 'Publish', icon: Send, view: null },
]

type View = 'records' | 'meetings'

function DemoSidebar({
  activeView,
  overdueCount,
  onSelect,
}: {
  activeView: View
  overdueCount: number
  onSelect: (v: View) => void
}) {
  return (
    <div className="flex h-full w-52 shrink-0 flex-col bg-[#1e3a5f] text-white">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
          <Shield className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold leading-tight">Clerkflow</p>
          <p className="text-[10px] text-white/50">Riverside, OH</p>
        </div>
      </div>

      <nav className="flex-1 px-2 pb-3">
        <p className="px-2 pb-1.5 pt-3 text-[9px] font-semibold uppercase tracking-wider text-white/40">
          Workspace
        </p>
        {NAV.map((item) => {
          const Icon = item.icon
          const active = item.view === activeView
          const clickable = item.view !== null
          const isRecords = item.view === 'records'
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.view && onSelect(item.view)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : clickable
                    ? 'text-white/70 hover:bg-white/10 hover:text-white'
                    : 'cursor-default text-white/40',
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {isRecords && overdueCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-[#dc2626] text-[9px] font-bold">
                  {overdueCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-white/10 px-3 py-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-semibold">
          BJ
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium">Barbara Jensen</p>
          <p className="truncate text-[10px] text-white/50">Town Clerk</p>
        </div>
      </div>
    </div>
  )
}

// ─── Records view ─────────────────────────────────────────────────────────────

function RecordsList({
  requests,
  onSelect,
}: {
  requests: DemoRequest[]
  onSelect: (id: string) => void
}) {
  const overdueCount = requests.filter((r) => r.status === 'overdue').length
  const filters: { key: Status | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'due-soon', label: 'Due soon' },
    { key: 'in-progress', label: 'In progress' },
    { key: 'complete', label: 'Complete' },
  ]
  const [filter, setFilter] = useState<Status | 'all'>('all')

  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  return (
    <div className="flex flex-col gap-4">
      {overdueCount > 0 && (
        <div className="flex items-center gap-2.5 rounded-lg border border-[#dc2626]/30 bg-[#dc2626]/5 px-3.5 py-2.5">
          <AlertTriangle className="size-4 shrink-0 text-[#dc2626]" />
          <p className="text-xs font-medium text-[#dc2626]">
            {overdueCount} request{overdueCount > 1 ? 's' : ''} overdue — response past statutory deadline
          </p>
        </div>
      )}

      <div className="flex gap-1 border-b border-border">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-2.5 py-1.5 text-xs font-medium transition-colors',
              filter === f.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {visible.map((req) => (
          <button
            key={req.id}
            type="button"
            onClick={() => onSelect(req.id)}
            className="flex items-center justify-between rounded-lg border border-border bg-white px-3.5 py-3 text-left transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground">{req.id}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_PILL[req.status])}>
                  {STATUS_LABEL[req.status]}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs font-medium text-foreground">{req.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {req.requester} · Received {req.received}
              </p>
            </div>
            <DeadlinePill req={req} />
          </button>
        ))}
      </div>
    </div>
  )
}

function RequestDetail({
  req,
  onBack,
  onStatusChange,
}: {
  req: DemoRequest
  onBack: () => void
  onStatusChange: (id: string, status: Status) => void
}) {
  const [replyText, setReplyText] = useState('')
  const [thread, setThread] = useState(req.thread)
  const [sending, setSending] = useState(false)

  function handleSend() {
    if (!replyText.trim()) return
    setSending(true)
    setTimeout(() => {
      setThread((t) => [
        ...t,
        {
          author: 'Barbara Jensen',
          role: 'Town Clerk',
          time: 'Just now',
          body: replyText,
        },
      ])
      setReplyText('')
      setSending(false)
    }, 600)
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" />
        Records Requests
      </button>

      {req.status === 'overdue' && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#dc2626]/30 bg-[#dc2626]/5 px-3.5 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#dc2626]" />
          <div>
            <p className="text-xs font-semibold text-[#dc2626]">Response is overdue</p>
            <p className="text-xs text-muted-foreground">
              Ohio public records law requires prompt response. Release records or send a status update.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Left: correspondence */}
        <div className="flex flex-col gap-3 sm:col-span-2">
          <div className="rounded-lg border border-border bg-white p-3.5">
            <p className="mb-2.5 text-xs font-semibold text-foreground">Request</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{req.summary}</p>
          </div>

          <div className="rounded-lg border border-border bg-white">
            <p className="border-b border-border px-3.5 py-2 text-xs font-semibold text-foreground">
              Correspondence
            </p>
            <div className="flex flex-col gap-2.5 p-3.5">
              {thread.map((msg, i) => (
                <div key={i} className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-foreground">
                      {msg.author}{' '}
                      <span className="font-normal text-muted-foreground">· {msg.role}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/80">{msg.body}</p>
                </div>
              ))}
              <div className="mt-1">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply to the requester…"
                  className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="mt-1.5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!replyText.trim() || sending}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-50"
                  >
                    <Send className="size-3" />
                    {sending ? 'Sending…' : 'Send reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: details + actions */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-white p-3.5">
            <p className="mb-2.5 text-xs font-semibold text-foreground">Details</p>
            <dl className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground"><User className="size-3" /> Requester</dt>
                <dd className="font-medium">{req.requester}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground"><Clock className="size-3" /> Received</dt>
                <dd className="font-medium">{req.received}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Deadline</dt>
                <dd className="font-medium">{req.deadline}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_PILL[req.status])}>
                    {STATUS_LABEL[req.status]}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {req.status !== 'complete' && (
            <div className="rounded-lg border border-border bg-white p-3.5">
              <p className="mb-2.5 text-xs font-semibold text-foreground">Actions</p>
              <div className="flex flex-col gap-1.5">
                {req.status !== 'in-progress' && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(req.id, 'in-progress')}
                    className="rounded-lg border border-border px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Mark as in progress
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onStatusChange(req.id, 'complete')}
                  className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-left text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  Mark as fulfilled
                </button>
              </div>
            </div>
          )}

          {req.status === 'complete' && (
            <div className="flex items-center gap-2 rounded-lg border border-[#16a34a]/30 bg-[#16a34a]/5 px-3 py-2.5">
              <CheckCircle2 className="size-4 shrink-0 text-[#16a34a]" />
              <p className="text-xs font-medium text-[#16a34a]">Records fulfilled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Meetings view ────────────────────────────────────────────────────────────

function MeetingsList({ meetings }: { meetings: DemoMeeting[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 border-b border-border">
        {['All', 'Upcoming', 'Past'].map((f, i) => (
          <button
            key={f}
            type="button"
            className={cn(
              'px-2.5 py-1.5 text-xs font-medium transition-colors',
              i === 0
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {meetings.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between rounded-lg border border-border bg-white px-3.5 py-3"
        >
          <div className="flex items-start gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">{m.title}</p>
              <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Clock className="size-3" /> {m.date} · {m.time}
              </p>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="size-3" /> {m.location}
              </p>
            </div>
          </div>
          <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-medium', m.statusColor)}>
            {m.displayStatus}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main demo ────────────────────────────────────────────────────────────────

export function HomepageDemo() {
  const [view, setView] = useState<View>('records')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusOverrides, setStatusOverrides] = useState<Partial<Record<string, Status>>>({})

  const requests = REQUESTS.map((r) => ({
    ...r,
    status: (statusOverrides[r.id] ?? r.status) as Status,
  }))

  const overdueCount = requests.filter((r) => r.status === 'overdue').length
  const selected = selectedId ? requests.find((r) => r.id === selectedId) ?? null : null

  function handleStatusChange(id: string, status: Status) {
    setStatusOverrides((s) => ({ ...s, [id]: status }))
    if (selectedId === id) {
      // keep detail view open, status updates in place
    }
  }

  function pageTitle() {
    if (view === 'records') {
      return selected ? selected.id : 'Records Requests'
    }
    return 'Meetings'
  }

  return (
    <div
      className="flex overflow-hidden rounded-xl border border-border shadow-xl"
      style={{ height: 480 }}
    >
      {/* Sidebar */}
      <DemoSidebar
        activeView={view}
        overdueCount={overdueCount}
        onSelect={(v) => { setView(v); setSelectedId(null) }}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#f8fafc]">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border bg-white px-5 py-3">
          <p className="text-sm font-semibold text-foreground">{pageTitle()}</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#16a34a]" title="Live demo" />
            <span className="text-[10px] text-muted-foreground">Live demo</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">
          {view === 'records' && !selected && (
            <RecordsList
              requests={requests}
              onSelect={setSelectedId}
            />
          )}
          {view === 'records' && selected && (
            <RequestDetail
              req={selected}
              onBack={() => setSelectedId(null)}
              onStatusChange={handleStatusChange}
            />
          )}
          {view === 'meetings' && <MeetingsList meetings={MEETINGS} />}
        </div>
      </div>
    </div>
  )
}
