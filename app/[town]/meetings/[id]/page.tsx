import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Clock, FileText } from 'lucide-react'
import { getTownBySlug, getPublishedMeeting } from '@/lib/server/public-data'

export default async function TownMeetingDetailPage({
  params,
}: {
  params: Promise<{ town: string; id: string }>
}) {
  const { town: slug, id } = await params
  const town = await getTownBySlug(slug)
  if (!town) notFound()

  const meeting = await getPublishedMeeting(town.id, id)
  if (!meeting) notFound()

  const agendaItems = 'agendaItems' in meeting ? meeting.agendaItems : []

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6">
      <Link
        href={`/${slug}/meetings`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to meetings
      </Link>

      <div className="mt-6">
        <span className="inline-flex rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
          Published
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {meeting.title}
        </h1>

        <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            {meeting.date} · {meeting.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            {meeting.location}
          </span>
        </div>
      </div>

      {agendaItems.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <FileText className="size-4" /> Agenda
          </h2>
          <ol className="mt-4 flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {agendaItems.map((item: { id: string; sortOrder: number; title: string; detail: string }) => (
              <li key={item.id} className="px-5 py-4">
                <div className="flex items-baseline gap-3">
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {item.sortOrder}.
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    {item.detail && (
                      <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {meeting.minutesDraft && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <FileText className="size-4" /> Minutes
          </h2>
          <div className="mt-4 rounded-xl border border-border bg-card px-5 py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {meeting.minutesDraft}
            </p>
          </div>
        </section>
      )}

      {!meeting.minutesDraft && meeting.minutesStatus !== 'not_started' && (
        <p className="mt-8 text-sm text-muted-foreground">
          Minutes are being prepared and will be published after approval.
        </p>
      )}

      <div className="mt-10 rounded-lg border border-border bg-muted/30 px-5 py-4 text-sm">
        <p className="font-medium text-foreground">Questions about this meeting?</p>
        <p className="mt-1 text-muted-foreground">
          Contact the town clerk's office or{' '}
          <Link href={`/${slug}/foia`} className="text-primary hover:underline">
            submit a records request
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
