import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  Send,
  Paperclip,
  User,
  CalendarDays,
  UserCheck,
  CheckCircle2,
  Circle,
  FileText,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { DeadlineBadge } from '@/components/deadline-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { FOIA_REQUESTS } from '@/lib/data'

const THREAD = [
  {
    author: 'Dana Whitfield',
    role: 'Requester',
    time: 'Jun 9, 2026 · 9:14 AM',
    body: 'Requesting all police incident reports filed for the 400 block of Maple Street during June 2026.',
  },
  {
    author: 'Barbara Jensen',
    role: 'Town Clerk',
    time: 'Jun 9, 2026 · 2:40 PM',
    body: 'Thank you for your request. We have logged it as FOIA-1042 and will respond within the statutory timeframe. We are coordinating with the Police Department to gather responsive records.',
  },
  {
    author: 'Barbara Jensen',
    role: 'Town Clerk',
    time: 'Jun 11, 2026 · 11:05 AM',
    body: 'An update: two reports may contain personal information requiring redaction. We are reviewing them now.',
  },
]

const WORKFLOW = [
  { label: 'Request logged', meta: 'Jun 9, 2026', state: 'done' },
  { label: 'Acknowledgment sent', meta: 'Jun 9, 2026', state: 'done' },
  { label: 'Records gathered', meta: '3 documents', state: 'done' },
  { label: 'Review & redact', meta: 'In progress', state: 'current' },
  { label: 'Release to requester', meta: 'Pending', state: 'pending' },
] as const

export default async function FoiaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const req = FOIA_REQUESTS.find((r) => r.id === id)
  if (!req) notFound()

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={req.title}
        description={`Received ${req.received} from ${req.requester}`}
        breadcrumbs={[
          { label: 'FOIA', href: '/app/foia' },
          { label: req.id },
        ]}
        actions={
          <>
            <Button variant="outline">Reassign</Button>
            <Button>
              <Send className="size-4" /> Release records
            </Button>
          </>
        }
      />

      {req.status === 'overdue' ? (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Response is overdue
              </p>
              <p className="text-sm text-muted-foreground">
                Ohio public records law requires a prompt response. Release
                records or send a status update to the requester.
              </p>
            </div>
          </div>
          <DeadlineBadge daysRemaining={req.daysRemaining} className="self-start sm:self-auto" />
        </div>
      ) : (
        <div className="mt-6">
          <DeadlineBadge daysRemaining={req.daysRemaining} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Correspondence</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {THREAD.map((msg, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-secondary/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {msg.author}{' '}
                    <span className="font-normal text-muted-foreground">
                      · {msg.role}
                    </span>
                  </p>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                  {msg.body}
                </p>
              </div>
            ))}

            <Separator />

            <div>
              <Textarea
                placeholder="Write a reply to the requester..."
                className="min-h-24 resize-none"
                aria-label="Reply to requester"
              />
              <div className="mt-3 flex items-center justify-between">
                <Button variant="ghost" size="sm">
                  <Paperclip className="size-4" /> Attach
                </Button>
                <Button>
                  <Send className="size-4" /> Send reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <DetailRow icon={User} label="Requester" value={req.requester} />
              <DetailRow
                icon={CalendarDays}
                label="Received"
                value={req.received}
              />
              <DetailRow
                icon={UserCheck}
                label="Assigned to"
                value={req.assignedTo}
              />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="size-4" /> Status
                </span>
                <StatusPill status={req.status} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Release workflow</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ol className="flex flex-col gap-4">
                {WORKFLOW.map((step) => (
                  <li key={step.label} className="flex items-start gap-3">
                    {step.state === 'done' ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" />
                    ) : step.state === 'current' ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                        <span className="size-2 rounded-full bg-primary" />
                      </span>
                    ) : (
                      <Circle className="size-5 shrink-0 text-muted-foreground/40" />
                    )}
                    <div>
                      <p
                        className={
                          step.state === 'pending'
                            ? 'text-sm font-medium text-muted-foreground'
                            : 'text-sm font-medium text-foreground'
                        }
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.meta}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button className="w-full">
                <Send className="size-4" /> Release records
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" /> {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
