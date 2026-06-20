import Link from 'next/link'
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  Users,
  ArrowRight,
  CheckCircle2,
  Plus,
  FilePlus,
  ClipboardList,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { StatusPill } from '@/components/status-pill'
import { DeadlineBadge } from '@/components/deadline-badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getTownView,
  listBoardTerms,
  listFoiaRequests,
  listLicenses,
  listMeetings,
} from '@/lib/server/data'

export default async function CommandCenterPage() {
  const [town, foiaRequests, meetings, boardTerms, allLicenses] = await Promise.all([
    getTownView(),
    listFoiaRequests(),
    listMeetings(),
    listBoardTerms(),
    listLicenses(),
  ])

  const overdue = foiaRequests.filter((r) => r.status === 'overdue')
  const dueThisWeek = foiaRequests.filter(
    (r) => r.daysRemaining >= 0 && r.daysRemaining <= 7,
  )
  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'scheduled' || m.status === 'draft',
  )
  const expiringTerms = boardTerms.filter((t) => t.expiringSoon)

  const pendingLicenses = allLicenses.filter((l) => l.status === 'pending')

  // Licenses pending more than 7 days (submittedAt is a formatted string like "Jun 10, 2026")
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const stalePendingLicenses = pendingLicenses.filter((l) => {
    const parsed = new Date(l.submittedAt)
    return !Number.isNaN(parsed.getTime()) && parsed < sevenDaysAgo
  })

  // "Needs attention" items: overdue + due-this-week FOIA first, then stale pending licenses (max 5 total)
  const foiaAttentionItems = [...overdue, ...dueThisWeek]
  const foiaSlots = Math.min(foiaAttentionItems.length, 5)
  const licenseSlots = Math.min(stalePendingLicenses.length, 5 - foiaSlots)
  const attentionFoiaItems = foiaAttentionItems.slice(0, foiaSlots)
  const attentionLicenseItems = stalePendingLicenses.slice(0, licenseSlots)
  const hasAttentionItems = attentionFoiaItems.length > 0 || attentionLicenseItems.length > 0

  function formatLicenseType(type: string) {
    return type.replace(/_/g, ' ')
  }

  function licensePendingDays(submittedAt: string) {
    const parsed = new Date(submittedAt)
    if (Number.isNaN(parsed.getTime())) return null
    const diff = Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Hello, ${town.clerk.name.split(' ')[0]}`}
        description="Here's what needs your attention today."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overdue requests"
          value={overdue.length}
          hint="Requires immediate response"
          icon={AlertTriangle}
          tone="danger"
          href="/app/records"
        />
        <StatCard
          label="Due this week"
          value={dueThisWeek.length}
          hint="FOIA requests approaching deadline"
          icon={FileText}
          tone="warning"
          href="/app/records"
        />
        <StatCard
          label="Upcoming meetings"
          value={upcomingMeetings.length}
          hint="Next 7 days"
          icon={CalendarClock}
          href="/app/meetings"
        />
        <StatCard
          label="Pending permits"
          value={pendingLicenses.length}
          hint="Awaiting review"
          icon={ClipboardList}
          tone={pendingLicenses.length > 0 ? 'warning' : 'default'}
          href="/app/services"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Needs attention</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <Link href="/app/records">
                  View all FOIA <ArrowRight className="size-4" />
                </Link>
              }
            />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {hasAttentionItems ? (
              <>
                {attentionFoiaItems.map((req) => (
                  <Link
                    key={req.id}
                    href={`/app/records/${req.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {req.id}
                        </span>
                        <StatusPill status={req.status} />
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                        {req.title}
                      </p>
                    </div>
                    <DeadlineBadge daysRemaining={req.daysRemaining} />
                  </Link>
                ))}
                {attentionLicenseItems.map((lic) => {
                  const days = licensePendingDays(lic.submittedAt)
                  return (
                    <Link
                      key={lic.id}
                      href={`/app/services/${lic.id}`}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {lic.id}
                          </span>
                          <StatusPill status={lic.status} />
                        </div>
                        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                          {lic.applicantName} — {formatLicenseType(lic.type)}
                        </p>
                      </div>
                      {days !== null && (
                        <span className="shrink-0 text-xs font-medium text-warning-foreground">
                          Pending {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="mb-2 size-8 text-muted-foreground/50" aria-hidden />
                <p className="text-sm font-medium text-muted-foreground">All caught up</p>
                <p className="mt-0.5 text-sm text-muted-foreground/70">
                  No overdue or urgent requests right now.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming meetings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {upcomingMeetings.map((m) => (
                <Link
                  key={m.id}
                  href={`/app/meetings/${m.id}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.date} · {m.time}
                    </p>
                  </div>
                  <StatusPill status={m.status} />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Board terms expiring</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {expiringTerms.map((t) => (
                <div
                  key={t.member}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {t.member}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.board} · {t.seat}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-warning-foreground">
                    {t.expires}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <Button variant="outline" size="sm" nativeButton={false} render={
            <Link href="/app/meetings/new">
              <Plus className="size-4" /> New meeting
            </Link>
          } />
          <Button variant="outline" size="sm" nativeButton={false} render={
            <Link href="/app/records/new">
              <FilePlus className="size-4" /> Log FOIA request
            </Link>
          } />
        </CardContent>
      </Card>
    </div>
  )
}
