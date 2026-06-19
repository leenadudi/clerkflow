import Link from 'next/link'
import { Mail, AlertCircle, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { requireStaffUser } from '@/lib/auth/app'
import { getDb } from '@/lib/db'
import { gmailConnections, processedEmails } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import type { ProcessedEmailRow } from '@/lib/db/schema'
import { CheckNowButton } from './check-now-button'

const CLASSIFICATION_LABELS: Record<string, string> = {
  records_request: 'Records request',
  meeting_related: 'Meeting',
  permit_application: 'Permit',
  resident_complaint: 'Complaint',
  board_related: 'Board',
  general_inquiry: 'General',
  spam_or_vendor: 'Spam',
}

const STATUS_MAP: Record<string, Parameters<typeof StatusPill>[0]['status']> = {
  draft: 'new',
  confirmed: 'in-progress',
  handled: 'complete',
  spam: 'denied',
  error: 'overdue',
}

export default async function InboxPage() {
  const context = await requireStaffUser()
  const db = getDb()

  const connection = context.townId
    ? await db.query.gmailConnections.findFirst({
        where: and(
          eq(gmailConnections.townId, context.townId),
          eq(gmailConnections.isActive, true),
        ),
      })
    : null

  const emails: ProcessedEmailRow[] = context.townId
    ? await db.query.processedEmails.findMany({
        where: eq(processedEmails.townId, context.townId),
        orderBy: [desc(processedEmails.receivedAt)],
        limit: 50,
      })
    : []

  const needsAction = emails.filter((e) => e.status === 'draft')
  const handled = emails.filter((e) => e.status !== 'draft')

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Inbox"
        description={
          connection
            ? `Receiving email at ${connection.gmailAddress}`
            : 'Connect Gmail to receive resident emails here.'
        }
        breadcrumbs={[{ label: 'Inbox' }]}
        actions={
          connection ? (
            <CheckNowButton />
          ) : (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/app/settings/email">Connect Gmail</Link>}
            />
          )
        }
      />

      {!connection && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Mail className="size-10 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">No Gmail connected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect your Gmail account to receive and classify resident emails.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/app/settings/email">Connect Gmail</Link>}
            />
          </CardContent>
        </Card>
      )}

      {connection && emails.length === 0 && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Mail className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No emails yet. Clerkflow checks for new messages every hour.
            </p>
          </CardContent>
        </Card>
      )}

      {needsAction.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertCircle className="size-4 text-warning" />
            Needs attention
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
              {needsAction.length}
            </span>
          </h2>
          <div className="flex flex-col gap-2">
            {needsAction.map((email) => (
              <EmailRow key={email.id} email={email} />
            ))}
          </div>
        </section>
      )}

      {handled.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">All emails</h2>
          <div className="flex flex-col gap-2">
            {handled.map((email) => (
              <EmailRow key={email.id} email={email} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function recordLink(email: ProcessedEmailRow): string {
  if (!email.linkedRecordId) return `/app/inbox/${email.id}`
  if (email.classification === 'permit_application') return `/app/services/${email.linkedRecordId}`
  if (email.classification === 'records_request' || email.classification === 'resident_complaint')
    return `/app/records/${email.linkedRecordId}`
  return `/app/inbox/${email.id}`
}

function EmailRow({ email }: { email: ProcessedEmailRow }) {
  const label = CLASSIFICATION_LABELS[email.classification] ?? email.classification
  const statusKey = STATUS_MAP[email.status] ?? 'new'
  const receivedAt = new Date(email.receivedAt)
  const dateStr = receivedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <Link href={recordLink(email)}>
      <Card className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-accent">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {label}
            </span>
            {email.aiConfidence === 'low' && (
              <span className="text-[11px] text-muted-foreground/60">low confidence</span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {email.subject || '(no subject)'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {email.fromName ? `${email.fromName} · ` : ''}{email.fromEmail}
          </p>
          {email.aiSummary && (
            <p className="mt-1 truncate text-xs text-muted-foreground/80">{email.aiSummary}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">{dateStr}</span>
          <StatusPill status={statusKey} />
        </div>
      </Card>
    </Link>
  )
}
