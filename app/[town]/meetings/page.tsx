import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { ResidentHeader } from '@/components/resident/header'
import { MEETINGS } from '@/lib/data'
import { isDatabaseConfigured, getDb } from '@/lib/db'
import { meetings, towns } from '@/lib/db/schema'
import { meetingToView } from '@/lib/db/mappers'
import { eq, desc, and } from 'drizzle-orm'

async function getPublishedMeetings(townSlug: string) {
  if (!isDatabaseConfigured()) {
    return MEETINGS.filter((m) => m.status === 'published')
  }
  const db = getDb()
  const town = await db.query.towns.findFirst({ where: eq(towns.slug, townSlug) })
  if (!town) return []
  const rows = await db.query.meetings.findMany({
    where: and(eq(meetings.townId, town.id), eq(meetings.status, 'published')),
    orderBy: [desc(meetings.startsAt)],
  })
  return rows.map(meetingToView)
}

export default async function TownMeetingsPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: townSlug } = await params
  const publishedMeetings = await getPublishedMeetings(townSlug)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ResidentHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Meetings & minutes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Published agendas, meeting minutes, and upcoming sessions.
          </p>
        </div>

        {publishedMeetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <Calendar className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No published meetings yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {publishedMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="rounded-xl border border-border bg-card px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meeting.date} · {meeting.time}
                    </p>
                    <p className="text-sm text-muted-foreground">{meeting.location}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                    Published
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-lg border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Need a specific record?</p>
          <p className="mt-1">
            Submit a public records request and we'll respond within the statutory timeframe.
          </p>
          <Link
            href={`/${townSlug}/foia`}
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            Submit a records request →
          </Link>
        </div>
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6 text-xs text-muted-foreground md:px-6">
          Powered by Clerkflow
        </div>
      </footer>
    </div>
  )
}
