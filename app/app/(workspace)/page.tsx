import Link from 'next/link'
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  Users,
  ArrowRight,
  Send,
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
  listMeetings,
} from '@/lib/server/data'

export default async function CommandCenterPage() {
  const [town, foiaRequests, meetings, boardTerms] = await Promise.all([
    getTownView(),
    listFoiaRequests(),
    listMeetings(),
    listBoardTerms(),
  ])

  const overdue = foiaRequests.filter((r) => r.status === 'overdue')
  const dueThisWeek = foiaRequests.filter(
    (r) => r.daysRemaining >= 0 && r.daysRemaining <= 7,
  )
  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'scheduled' || m.status === 'draft',
  )
  const expiringTerms = boardTerms.filter((t) => t.expiringSoon)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Good morning, ${town.clerk.name.split(' ')[0]}`}
        description="Here's what needs your attention today."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overdue FOIA"
          value={overdue.length}
          hint="Requires immediate response"
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="Due this week"
          value={dueThisWeek.length}
          hint="FOIA requests approaching deadline"
          icon={FileText}
          tone="warning"
        />
        <StatCard
          label="Upcoming meetings"
          value={upcomingMeetings.length}
          hint="Next 7 days"
          icon={CalendarClock}
        />
        <StatCard
          label="Board terms expiring"
          value={expiringTerms.length}
          hint="Within 60 days"
          icon={Users}
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
                <Link href="/app/foia">
                  View all FOIA <ArrowRight className="size-4" />
                </Link>
              }
            />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[...overdue, ...dueThisWeek].slice(0, 4).map((req) => (
              <Link
                key={req.id}
                href={`/app/foia/${req.id}`}
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
        <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Resident hub is live
            </p>
            <p className="text-sm text-muted-foreground">
              Residents can view meetings, submit requests, and track status at
              your public hub.
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/${town.slug}`}>
                <Send className="size-4" /> View public hub
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
