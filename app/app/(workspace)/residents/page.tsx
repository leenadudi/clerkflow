import { Users } from 'lucide-react'
import { eq, desc } from 'drizzle-orm'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { StatusPill, type StatusKey } from '@/components/status-pill'
import { Card, CardContent } from '@/components/ui/card'
import { requireStaffUser } from '@/lib/auth/app'
import { withTownContext } from '@/lib/db'
import { foiaRequests, licenses } from '@/lib/db/schema'

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type ResidentRow = {
  email: string
  name: string
  interactions: number
  lastActivity: Date
  lastPublicId: string
  lastStatus: string
}

export default async function ResidentsPage() {
  const context = await requireStaffUser()
  const { townId } = context

  let residents: ResidentRow[] = []

  if (townId) {
    const [foiaRows, licenseRows] = await withTownContext(townId, async (db) => {
      return Promise.all([
        db
          .select({
            requesterName: foiaRequests.requesterName,
            requesterEmail: foiaRequests.requesterEmail,
            receivedAt: foiaRequests.receivedAt,
            publicId: foiaRequests.publicId,
            status: foiaRequests.status,
          })
          .from(foiaRequests)
          .where(eq(foiaRequests.townId, townId))
          .orderBy(desc(foiaRequests.receivedAt))
          .limit(100),
        db
          .select({
            applicantName: licenses.applicantName,
            applicantEmail: licenses.applicantEmail,
            submittedAt: licenses.submittedAt,
            publicId: licenses.publicId,
            status: licenses.status,
          })
          .from(licenses)
          .where(eq(licenses.townId, townId))
          .orderBy(desc(licenses.submittedAt))
          .limit(100),
      ])
    })

    // Merge by email, deduplicating. Use email as key; fall back to name for
    // anonymous contacts without an email address.
    const map = new Map<string, ResidentRow>()

    for (const row of foiaRows) {
      const key = row.requesterEmail?.trim().toLowerCase() || `__name__${row.requesterName.trim().toLowerCase()}`
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          email: row.requesterEmail ?? '',
          name: row.requesterName,
          interactions: 1,
          lastActivity: row.receivedAt,
          lastPublicId: row.publicId,
          lastStatus: row.status,
        })
      } else {
        existing.interactions += 1
        if (row.receivedAt > existing.lastActivity) {
          existing.lastActivity = row.receivedAt
          existing.lastPublicId = row.publicId
          existing.lastStatus = row.status
        }
      }
    }

    for (const row of licenseRows) {
      const key = row.applicantEmail?.trim().toLowerCase() || `__name__${row.applicantName.trim().toLowerCase()}`
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          email: row.applicantEmail ?? '',
          name: row.applicantName,
          interactions: 1,
          lastActivity: row.submittedAt,
          lastPublicId: row.publicId,
          lastStatus: row.status,
        })
      } else {
        existing.interactions += 1
        if (row.submittedAt > existing.lastActivity) {
          existing.lastActivity = row.submittedAt
          existing.lastPublicId = row.publicId
          existing.lastStatus = row.status
        }
      }
    }

    residents = Array.from(map.values())
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
      .slice(0, 50)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Residents"
        description="Everyone who has contacted the town through Clerkflow."
        breadcrumbs={[{ label: 'Residents' }]}
      />

      <div className="mt-6">
        {residents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No residents yet"
            description="They'll appear here when someone submits a request or permit application."
          />
        ) : (
          <Card className="overflow-hidden p-0">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 border-b border-border bg-muted/30 px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Name</span>
              <span>Email</span>
              <span className="text-right">Interactions</span>
              <span className="text-right">Last contact</span>
              <span>Last status</span>
            </div>
            <div className="divide-y divide-border">
              {residents.map((resident, i) => (
                <div
                  key={resident.email || `resident-${i}`}
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5"
                >
                  <p className="truncate text-sm font-medium text-foreground">
                    {resident.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {resident.email || <span className="italic text-muted-foreground/60">No email</span>}
                  </p>
                  <p className="text-right text-sm tabular-nums text-foreground">
                    {resident.interactions}
                  </p>
                  <p className="text-right text-sm text-muted-foreground">
                    {formatDate(resident.lastActivity)}
                  </p>
                  <div className="flex justify-end">
                    <StatusPill status={resident.lastStatus as StatusKey} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
