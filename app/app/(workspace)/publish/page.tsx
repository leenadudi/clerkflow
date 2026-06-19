import Link from 'next/link'
import { ExternalLink, Calendar, FileText, Globe } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/status-pill'
import { listPublishedMeetings, listFoiaRequests, getTownView } from '@/lib/server/data'

export default async function PublishPage() {
  const [publishedMeetings, foiaRequests, town] = await Promise.all([
    listPublishedMeetings(),
    listFoiaRequests(),
    getTownView(),
  ])

  const completedFoia = foiaRequests.filter((r) => r.status === 'complete')
  const residentHubUrl = `/${town.slug}`
  const residentHubDisplay = `clerkflow.software/${town.slug}`

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Publish"
        description="What residents can see on your public hub."
        breadcrumbs={[{ label: 'Publish' }]}
        actions={
          <a
            href={residentHubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Globe className="size-4" /> View resident hub
            <ExternalLink className="size-3 opacity-60" />
          </a>
        }
      />

      <div className="mt-6 rounded-lg border border-border bg-muted/30 px-5 py-4">
        <p className="text-sm font-medium text-foreground">Resident hub</p>
        <a
          href={residentHubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 text-sm text-primary hover:underline"
        >
          {residentHubDisplay}
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          Residents can view published meetings, submit FOIA requests, apply for permits, and track
          their requests — no account required.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calendar className="size-4 text-muted-foreground" />
              Published meetings
            </h2>
            <Link href="/app/meetings" className="text-xs text-primary hover:underline">
              Manage meetings →
            </Link>
          </div>

          {publishedMeetings.length === 0 ? (
            <Card className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">No published meetings yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Open a meeting and click "Publish to resident hub."
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {publishedMeetings.slice(0, 5).map((meeting) => (
                <Link key={meeting.id} href={`/app/meetings/${meeting.id}`}>
                  <Card className="flex items-center justify-between px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent">
                    <div>
                      <p className="text-sm font-medium text-foreground">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {meeting.date} · {meeting.time} · {meeting.location}
                      </p>
                    </div>
                    <StatusPill status="published" />
                  </Card>
                </Link>
              ))}
              {publishedMeetings.length > 5 && (
                <Link href="/app/meetings" className="text-center text-xs text-primary hover:underline py-1">
                  View all {publishedMeetings.length} published meetings
                </Link>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-muted-foreground" />
              Completed FOIA requests
            </h2>
            <Link href="/app/records" className="text-xs text-primary hover:underline">
              Manage records →
            </Link>
          </div>

          {completedFoia.length === 0 ? (
            <Card className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">No completed FOIA requests yet.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {completedFoia.slice(0, 5).map((req) => (
                <Link key={req.id} href={`/app/records/${req.id}`}>
                  <Card className="flex items-center justify-between px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{req.id}</p>
                      <p className="text-sm font-medium text-foreground">{req.title}</p>
                    </div>
                    <StatusPill status="complete" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Public pages</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Meetings archive', path: '/meetings' },
              { label: 'Submit a FOIA request', path: '/foia' },
              { label: 'Apply for a permit', path: '/apply' },
              { label: 'Track my request', path: '/track' },
            ].map(({ label, path }) => (
              <a
                key={path}
                href={`${residentHubUrl}${path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
              >
                {label}
                <ExternalLink className="size-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
