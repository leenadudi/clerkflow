import { notFound } from 'next/navigation'
import { Clock, MapPin, FileText } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { getFullMeeting, getTownView } from '@/lib/server/data'
import { PublishButton } from './_components/publish-button'
import { MeetingTabs } from './_components/meeting-tabs'

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getFullMeeting(id)
  if (!result) notFound()

  const { meeting, agenda, motions, actionItems, attendance } = result

  let townSlug: string | undefined
  let residentHubEnabled = false
  try {
    const town = await getTownView()
    townSlug = town?.slug
    residentHubEnabled = town?.residentHubEnabled ?? false
  } catch {
    // no-op — town info is optional
  }

  const agendaPublished = !!meeting.agendaPublishedAt
  const minutesPublished = meeting.status === 'published'
  const showPublishButton = !agendaPublished && !minutesPublished

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={meeting.title}
        description={`${meeting.body} · ${meeting.date}`}
        breadcrumbs={[
          { label: 'Meetings', href: '/app/meetings' },
          { label: meeting.body },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`/api/app/meetings/${id}/print?print=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FileText className="size-4" />
              Export agenda PDF
            </a>
            {showPublishButton && <PublishButton meetingId={id} />}
          </div>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <StatusPill status={meeting.status} />
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" /> {meeting.date} at {meeting.time}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="size-4" /> {meeting.location}
        </span>
      </div>

      <MeetingTabs
        meetingId={id}
        agenda={agenda}
        motions={motions}
        actionItems={actionItems}
        attendance={attendance}
        status={meeting.status}
        minutesStatus={meeting.minutesStatus}
        agendaPublishedAt={meeting.agendaPublishedAt}
        minutesDraft={meeting.minutesDraft}
        presidingOfficer={meeting.presidingOfficer}
        townSlug={townSlug}
        residentHubEnabled={residentHubEnabled}
      />
    </div>
  )
}
