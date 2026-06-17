import Link from 'next/link'
import { Plus, Inbox } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill, type StatusKey } from '@/components/status-pill'
import { DeadlineBadge } from '@/components/deadline-badge'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getTownView, listFoiaRequests } from '@/lib/server/data'

const COLUMNS: { key: StatusKey; title: string }[] = [
  { key: 'new', title: 'New' },
  { key: 'in-progress', title: 'In progress' },
  { key: 'due-soon', title: 'Due soon' },
  { key: 'overdue', title: 'Overdue' },
  { key: 'complete', title: 'Complete' },
]

export default async function FoiaQueuePage() {
  const [foiaRequests, town] = await Promise.all([
    listFoiaRequests(),
    getTownView(),
  ])

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="FOIA requests"
        description="Public records requests across all departments. Respond before the statutory deadline."
        breadcrumbs={[{ label: 'FOIA' }]}
        actions={
          <Button>
            <Plus className="size-4" /> New request
          </Button>
        }
      />

      {foiaRequests.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Inbox}
            title="No FOIA requests yet"
            description={`Residents can submit public records requests at ${town.slug}.clerkflow.software/foia`}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {COLUMNS.map((col) => {
            const items = foiaRequests.filter((r) => r.status === col.key)
            return (
              <div key={col.key} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <StatusPill status={col.key} label={col.title} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((req) => (
                    <Link key={req.id} href={`/app/foia/${req.id}`}>
                      <Card className="gap-2 p-4 transition-colors hover:border-primary/40 hover:bg-accent">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {req.id}
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-snug text-foreground">
                          {req.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.requester} · {req.received}
                        </p>
                        {req.status !== 'complete' ? (
                          <div className="pt-1">
                            <DeadlineBadge daysRemaining={req.daysRemaining} />
                          </div>
                        ) : null}
                      </Card>
                    </Link>
                  ))}
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                      None
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
