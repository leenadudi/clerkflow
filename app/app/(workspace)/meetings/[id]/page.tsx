import { notFound } from 'next/navigation'
import { Clock, MapPin, Eye, Send, GripVertical, Plus } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, ListChecks } from 'lucide-react'
import { getMeeting, getMeetingAgenda } from '@/lib/server/data'

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const meeting = await getMeeting(id)
  if (!meeting) notFound()

  const agenda = await getMeetingAgenda(id)

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
          <>
            <Button variant="outline">
              <Eye className="size-4" /> Preview
            </Button>
            <Button>
              <Send className="size-4" /> Publish to resident hub
            </Button>
          </>
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

      <Tabs defaultValue="agenda" className="mt-6">
        <TabsList>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="actions">Action items</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="agenda" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {agenda.map((item) => (
                  <li
                    key={item.n}
                    className="flex items-start gap-4 px-5 py-4"
                  >
                    <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                    <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                      {item.n}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.detail ? (
                        <p className="text-xs text-muted-foreground">
                          {item.detail}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border p-4">
                <Button variant="ghost" size="sm">
                  <Plus className="size-4" /> Add agenda item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minutes" className="mt-4">
          <EmptyState
            icon={FileText}
            title="Minutes not started"
            description="Minutes can be drafted after the meeting. Start from the agenda to keep items in order."
            action={<Button variant="outline">Start minutes from agenda</Button>}
          />
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <EmptyState
            icon={ListChecks}
            title="No action items yet"
            description="Assign follow-ups to staff as votes and motions are recorded during the meeting."
          />
        </TabsContent>

        <TabsContent value="publish" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Ready to publish
                </p>
                <p className="text-sm text-muted-foreground">
                  Publishing makes the agenda visible on your public resident hub
                  immediately.
                </p>
              </div>
              <Button>
                <Send className="size-4" /> Publish to resident hub
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
