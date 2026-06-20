import Link from 'next/link'
import { Inbox, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill, type StatusKey } from '@/components/status-pill'
import { DeadlineBadge } from '@/components/deadline-badge'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { listFoiaRequests } from '@/lib/server/data'
import { cn } from '@/lib/utils'
import type { FoiaRequest } from '@/lib/data'
import NewRequestForm from './_components/new-request-form'

// ---------------------------------------------------------------------------
// Filter config
// ---------------------------------------------------------------------------

type FilterKey = 'all' | 'new' | 'in-progress' | 'due-soon' | 'overdue' | 'complete' | 'denied'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'due-soon', label: 'Due soon' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'complete', label: 'Complete' },
  { key: 'denied', label: 'Denied' },
]

function filterRequests(requests: FoiaRequest[], filter: FilterKey): FoiaRequest[] {
  if (filter === 'all') return requests
  return requests.filter((r) => r.status === filter)
}

// ---------------------------------------------------------------------------
// Sort: overdue first, then by deadline ascending, then received descending
// ---------------------------------------------------------------------------

const STATUS_SORT_ORDER: Record<string, number> = {
  overdue: 0,
  'due-soon': 1,
  'in-progress': 2,
  new: 3,
  complete: 4,
  denied: 5,
}

function sortRequests(requests: FoiaRequest[]): FoiaRequest[] {
  return [...requests].sort((a, b) => {
    const aOrder = STATUS_SORT_ORDER[a.status] ?? 99
    const bOrder = STATUS_SORT_ORDER[b.status] ?? 99

    // Overdue first
    if (a.status === 'overdue' && b.status === 'overdue') {
      // Most overdue (most negative daysRemaining) first
      return a.daysRemaining - b.daysRemaining
    }

    // Active requests sorted by deadline ascending
    const aActive = a.status !== 'complete' && a.status !== 'denied'
    const bActive = b.status !== 'complete' && b.status !== 'denied'
    if (aActive && bActive && aOrder === bOrder) {
      return a.daysRemaining - b.daysRemaining
    }

    // Different status groups — use order
    if (aOrder !== bOrder) return aOrder - bOrder

    // Complete/denied: received descending (no daysRemaining meaning)
    return 0
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function RecordsRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams
  const rawFilter = params.filter ?? 'all'
  const activeFilter: FilterKey = FILTERS.some((f) => f.key === rawFilter)
    ? (rawFilter as FilterKey)
    : 'all'

  const allRequests = await listFoiaRequests()
  const overdueRequests = allRequests.filter((r) => r.status === 'overdue')
  const filtered = filterRequests(allRequests, activeFilter)
  const sorted = sortRequests(filtered)

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Public records"
        description="Open records requests across all departments. Respond before the statutory deadline."
        breadcrumbs={[{ label: 'Records Requests' }]}
        actions={<NewRequestForm />}
      />

      {/* Overdue alert banner */}
      {overdueRequests.length > 0 && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden />
            <p className="text-sm font-medium text-destructive">
              {overdueRequests.length === 1
                ? '1 request overdue'
                : `${overdueRequests.length} requests overdue`}{' '}
              — response past statutory deadline.
            </p>
          </div>
          <Link
            href="/app/records?filter=overdue"
            className="shrink-0 text-sm font-medium text-destructive underline-offset-2 hover:underline"
          >
            View overdue
          </Link>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mt-6 flex gap-1 border-b border-border">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/app/records' : `/app/records?filter=${f.key}`}
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

      {/* Request list */}
      <div className="mt-4 flex flex-col gap-3">
        {allRequests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No records requests yet"
            description="Share the public records request link with residents to start receiving requests."
            action={<NewRequestForm />}
          />
        ) : sorted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No requests found.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeFilter === 'overdue'
                ? 'No overdue requests. All responses are on track.'
                : activeFilter === 'due-soon'
                  ? 'No requests due soon.'
                  : activeFilter === 'new'
                    ? 'No new requests.'
                    : activeFilter === 'in-progress'
                      ? 'No requests in progress.'
                      : activeFilter === 'complete'
                        ? 'No completed requests yet.'
                        : activeFilter === 'denied'
                          ? 'No denied requests.'
                          : 'No requests match this filter.'}
            </p>
          </div>
        ) : (
          sorted.map((req) => (
            <Link key={req.id} href={`/app/records/${req.id}`}>
              <Card className="transition-colors hover:border-primary/40 hover:bg-accent">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: request ID, name, received */}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {req.id}
                      </span>
                      <StatusPill status={req.status as StatusKey} />
                    </div>
                    <p className="truncate text-sm font-medium text-foreground">
                      {req.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {req.requester} · Received {req.received}
                    </p>
                  </div>

                  {/* Right: deadline badge */}
                  {req.status !== 'complete' && req.status !== 'denied' && (
                    <div className="shrink-0 pl-0 sm:pl-4">
                      <DeadlineBadge daysRemaining={req.daysRemaining} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
