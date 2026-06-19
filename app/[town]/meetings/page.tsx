import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { getPublishedMeetingsList, getTownBySlug } from '@/lib/server/public-data'

export default async function TownMeetingsPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: slug } = await params
  const town = await getTownBySlug(slug)
  const publishedMeetings = town ? await getPublishedMeetingsList(town.id) : []

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6">
      <h1 className="text-2xl font-bold text-foreground">Meetings & minutes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Published agendas, meeting minutes, and upcoming sessions.
      </p>

      <div className="mt-8">
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
              <Link
                key={meeting.id}
                href={`/${slug}/meetings/${meeting.id}`}
                className="group block rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {meeting.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meeting.date} · {meeting.time}
                    </p>
                    <p className="text-sm text-muted-foreground">{meeting.location}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                    Published
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Need a specific record?</p>
        <p className="mt-1">
          Submit a public records request and we'll respond within the statutory timeframe.
        </p>
        <Link
          href={`/${slug}/foia`}
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Submit a records request →
        </Link>
      </div>
    </main>
  )
}
