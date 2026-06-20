import { FileText, CalendarCheck, Briefcase } from 'lucide-react'
import { count, eq, and, lt, notInArray, desc } from 'drizzle-orm'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusPill, type StatusKey } from '@/components/status-pill'
import { requireStaffUser } from '@/lib/auth/app'
import { withTownContext } from '@/lib/db'
import { foiaRequests, meetings, licenses } from '@/lib/db/schema'

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function ReportsPage() {
  const context = await requireStaffUser()
  const { townId } = context

  if (!townId) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Reports"
          description="Usage and compliance reports for your town."
          breadcrumbs={[{ label: 'Reports' }]}
        />
        <ReportsContent
          foiaTotal={0}
          foiaComplete={0}
          foiaDenied={0}
          foiaOverdue={0}
          meetingsTotal={0}
          meetingsPublished={0}
          licensesTotal={0}
          licensesApproved={0}
          licensesPending={0}
          recentFoia={[]}
        />
      </div>
    )
  }

  const now = new Date()
  const terminalStatuses = ['complete', 'denied', 'withdrawn']

  const [
    [foiaTotalRow],
    [foiaCompleteRow],
    [foiaDeniedRow],
    [foiaOverdueRow],
    [meetingsTotalRow],
    [meetingsPublishedRow],
    [licensesTotalRow],
    [licensesApprovedRow],
    [licensesPendingRow],
    recentFoia,
  ] = await withTownContext(townId, async (db) => {
    return Promise.all([
      db.select({ value: count() }).from(foiaRequests).where(eq(foiaRequests.townId, townId)),
      db.select({ value: count() }).from(foiaRequests).where(and(eq(foiaRequests.townId, townId), eq(foiaRequests.status, 'complete'))),
      db.select({ value: count() }).from(foiaRequests).where(and(eq(foiaRequests.townId, townId), eq(foiaRequests.status, 'denied'))),
      db.select({ value: count() }).from(foiaRequests).where(
        and(
          eq(foiaRequests.townId, townId),
          lt(foiaRequests.deadlineAt, now),
          notInArray(foiaRequests.status, terminalStatuses),
        ),
      ),
      db.select({ value: count() }).from(meetings).where(eq(meetings.townId, townId)),
      db.select({ value: count() }).from(meetings).where(and(eq(meetings.townId, townId), eq(meetings.status, 'published'))),
      db.select({ value: count() }).from(licenses).where(eq(licenses.townId, townId)),
      db.select({ value: count() }).from(licenses).where(and(eq(licenses.townId, townId), eq(licenses.status, 'approved'))),
      db.select({ value: count() }).from(licenses).where(and(eq(licenses.townId, townId), eq(licenses.status, 'pending'))),
      db
        .select({
          publicId: foiaRequests.publicId,
          requesterName: foiaRequests.requesterName,
          status: foiaRequests.status,
          receivedAt: foiaRequests.receivedAt,
        })
        .from(foiaRequests)
        .where(eq(foiaRequests.townId, townId))
        .orderBy(desc(foiaRequests.receivedAt))
        .limit(5),
    ])
  })

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Reports"
        description="Usage and compliance reports for your town."
        breadcrumbs={[{ label: 'Reports' }]}
      />
      <ReportsContent
        foiaTotal={foiaTotalRow.value}
        foiaComplete={foiaCompleteRow.value}
        foiaDenied={foiaDeniedRow.value}
        foiaOverdue={foiaOverdueRow.value}
        meetingsTotal={meetingsTotalRow.value}
        meetingsPublished={meetingsPublishedRow.value}
        licensesTotal={licensesTotalRow.value}
        licensesApproved={licensesApprovedRow.value}
        licensesPending={licensesPendingRow.value}
        recentFoia={recentFoia.map((r) => ({ ...r, receivedAt: r.receivedAt }))}
      />
    </div>
  )
}

function ReportsContent({
  foiaTotal,
  foiaComplete,
  foiaDenied,
  foiaOverdue,
  meetingsTotal,
  meetingsPublished,
  licensesTotal,
  licensesApproved,
  licensesPending,
  recentFoia,
}: {
  foiaTotal: number
  foiaComplete: number
  foiaDenied: number
  foiaOverdue: number
  meetingsTotal: number
  meetingsPublished: number
  licensesTotal: number
  licensesApproved: number
  licensesPending: number
  recentFoia: { publicId: string; requesterName: string; status: string; receivedAt: Date }[]
}) {
  const resolved = foiaComplete + foiaDenied
  const onTimeRate =
    resolved + foiaOverdue > 0
      ? Math.round((foiaComplete / (foiaComplete + foiaOverdue)) * 100)
      : null

  return (
    <>
      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="FOIA requests"
          value={foiaTotal}
          hint={`${foiaComplete} complete`}
          icon={FileText}
          tone={foiaOverdue > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Meetings held"
          value={meetingsPublished}
          hint={`${meetingsTotal} total on record`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Permits & licenses"
          value={`${licensesApproved}/${licensesTotal}`}
          hint={`${licensesPending} pending review`}
          icon={Briefcase}
          tone={licensesPending > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* FOIA compliance */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">FOIA compliance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">On-time response rate</span>
            <span className="font-semibold text-foreground">
              {onTimeRate !== null ? `${onTimeRate}%` : '—'}
            </span>
          </div>
          {onTimeRate !== null && (
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${onTimeRate}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overdue requests</span>
            <span className="flex items-center gap-2">
              {foiaOverdue > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  {foiaOverdue} overdue
                </Badge>
              ) : (
                <span className="font-medium text-success">None</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fulfilled / denied / total</span>
            <span className="font-medium text-foreground">
              {foiaComplete} / {foiaDenied} / {foiaTotal}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent FOIA activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentFoia.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">
              No FOIA requests yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recentFoia.map((req) => (
                <div
                  key={req.publicId}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {req.requesterName}
                    </p>
                    <p className="text-xs text-muted-foreground">{req.publicId}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(req.receivedAt)}
                    </span>
                    <StatusPill status={req.status as StatusKey} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
