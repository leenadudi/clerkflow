import Link from 'next/link'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { listMeetings } from '@/lib/server/data'
import type { Meeting } from '@/lib/data'
import { NewMeetingButton } from './_components/new-meeting-button'
import { MeetingQuickLinks } from './_components/quick-links'

// --- Filter config ---

type FilterKey = 'all' | 'upcoming' | 'past' | 'draft' | 'published'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
]

function filterMeetings(meetings: Meeting[], filter: FilterKey): Meeting[] {
  switch (filter) {
    case 'upcoming':
      return meetings.filter((m) => !m.isPast && m.status !== 'cancelled')
    case 'past':
      return meetings.filter((m) => m.isPast)
    case 'draft':
      return meetings.filter((m) => m.status === 'draft')
    case 'published':
      return meetings.filter((m) => m.status === 'published')
    default:
      return meetings
  }
}

// --- Status pipeline ---

type DisplayStatus = 'Draft' | 'Agenda published' | 'Minutes pending' | 'Complete'

function displayStatus(m: Meeting): DisplayStatus {
  if (m.minutesStatus === 'approved' || m.status === 'published') {
    // A past meeting with approved minutes is fully complete
    if (m.isPast) return 'Complete'
  }
  if (m.isPast) {
    if (m.minutesStatus === 'approved') return 'Complete'
    return 'Minutes pending'
  }
  if (m.agendaPublishedAt) return 'Agenda published'
  return 'Draft'
}

const STATUS_BADGE: Record<
  DisplayStatus,
  { className: string; dot: string }
> = {
  Draft: {
    className: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  'Agenda published': {
    className: 'bg-primary/10 text-primary',
    dot: 'bg-primary',
  },
  'Minutes pending': {
    className: 'bg-warning/15 text-warning-foreground',
    dot: 'bg-warning',
  },
  Complete: {
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
}

function DisplayStatusBadge({ status }: { status: DisplayStatus }) {
  const s = STATUS_BADGE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        s.className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', s.dot)} aria-hidden />
      {status}
    </span>
  )
}

// --- Page ---

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams
  const rawFilter = params.filter ?? 'all'
  const activeFilter: FilterKey = FILTERS.some((f) => f.key === rawFilter)
    ? (rawFilter as FilterKey)
    : 'all'

  const allMeetings = await listMeetings()
  const meetings = filterMeetings(allMeetings, activeFilter)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Meetings"
        description="Agendas, minutes, and action items for every town body."
        breadcrumbs={[{ label: 'Meetings' }]}
        actions={<NewMeetingButton />}
      />

      {/* Filter tabs */}
      <div className="mt-6 flex gap-1 border-b border-border">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/app/meetings' : `/app/meetings?filter=${f.key}`}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors',
              activeFilter === f.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Meeting list */}
      <div className="mt-4 flex flex-col gap-3">
        {meetings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No meetings found.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeFilter === 'upcoming'
                ? 'No upcoming meetings scheduled. Create one to get started.'
                : activeFilter === 'past'
                  ? 'No past meetings on record yet.'
                  : activeFilter === 'draft'
                    ? 'No draft meetings. All meetings have been published.'
                    : activeFilter === 'published'
                      ? 'No published meetings yet.'
                      : 'No meetings yet. Create your first meeting to get started.'}
            </p>
          </div>
        ) : (
          meetings.map((m) => {
            const status = displayStatus(m)
            return (
              <Card key={m.id} className="relative transition-colors hover:border-primary/40 hover:bg-accent">
                {/* Stretched link covers the whole card; inner links sit above it via z-index */}
                <Link
                  href={`/app/meetings/${m.id}`}
                  className="absolute inset-0 rounded-[inherit]"
                  aria-label={m.title}
                />
                <CardContent className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {m.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.body}</p>
                      <MeetingQuickLinks meetingId={m.id} isPast={m.isPast ?? false} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pl-13 text-xs text-muted-foreground sm:pl-0">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" /> {m.date} · {m.time}
                    </span>
                    <span className="hidden items-center gap-1.5 md:flex">
                      <MapPin className="size-3.5" /> {m.location}
                    </span>
                    <DisplayStatusBadge status={status} />
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
