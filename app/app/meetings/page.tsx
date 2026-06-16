import Link from 'next/link'
import { Plus, Calendar, MapPin, Clock } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MEETINGS } from '@/lib/data'

export default function MeetingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Meetings"
        description="Agendas, minutes, and action items for every town body."
        breadcrumbs={[{ label: 'Meetings' }]}
        actions={
          <Button>
            <Plus className="size-4" /> New meeting
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-3">
        {MEETINGS.map((m) => (
          <Link key={m.id} href={`/app/meetings/${m.id}`}>
            <Card className="transition-colors hover:border-primary/40 hover:bg-accent">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.body}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pl-13 text-xs text-muted-foreground sm:pl-0">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {m.date} · {m.time}
                  </span>
                  <span className="hidden items-center gap-1.5 md:flex">
                    <MapPin className="size-3.5" /> {m.location}
                  </span>
                  <StatusPill status={m.status} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
