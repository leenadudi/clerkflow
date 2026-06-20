import { Calendar } from 'lucide-react'
import { getPublishedMeetingsList, getTownBySlug } from '@/lib/server/public-data'

export default async function EmbedMeetingsPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: slug } = await params
  const town = await getTownBySlug(slug)
  const meetings = town ? await getPublishedMeetingsList(town.id) : []

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold text-foreground">Meetings &amp; minutes</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Published agendas and upcoming sessions</p>

      <div className="mt-4">
        {meetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <Calendar className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No published meetings yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {meetings.map((meeting) => (
              <a
                key={meeting.id}
                href={`/${slug}/meetings/${meeting.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <p className="font-medium text-foreground">{meeting.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {meeting.date} · {meeting.time}
                  {meeting.location ? ` · ${meeting.location}` : ''}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Powered by{' '}
        <a href="https://clerkflow.software" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Clerkflow
        </a>
      </p>
    </div>
  )
}
