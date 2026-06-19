import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { requireStaffUser } from '@/lib/auth/app'
import { getDb } from '@/lib/db'
import { processedEmails } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ReplyForm } from './reply-form'

const RECORD_LINKS: Record<string, (id: string) => { href: string; label: string }> = {
  records_request: (id) => ({ href: `/app/records/${id}`, label: 'View records request' }),
  resident_complaint: (id) => ({ href: `/app/records/${id}`, label: 'View complaint' }),
  permit_application: (id) => ({ href: `/app/services/${id}`, label: 'View permit application' }),
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  records_request: 'Records request',
  meeting_related: 'Meeting',
  permit_application: 'Permit',
  resident_complaint: 'Complaint',
  board_related: 'Board',
  general_inquiry: 'General',
  spam_or_vendor: 'Spam',
}

export default async function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await requireStaffUser()
  if (!context.townId) notFound()
  const townId = context.townId
  const db = getDb()

  const email = await db.query.processedEmails.findFirst({
    where: and(
      eq(processedEmails.id, id),
      eq(processedEmails.townId, townId),
    ),
  })
  if (!email) notFound()

  const receivedAt = new Date(email.receivedAt).toLocaleString()
  const label = CLASSIFICATION_LABELS[email.classification] ?? email.classification

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <Link
          href="/app/inbox"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to inbox
        </Link>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base">{email.subject || '(no subject)'}</CardTitle>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {email.fromName || email.fromEmail}
            </span>
            {email.fromName && <span> · {email.fromEmail}</span>}
            <span> · {receivedAt}</span>
          </div>
          {email.aiSummary && (
            <p className="mt-2 text-sm italic text-muted-foreground">
              AI summary: {email.aiSummary}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
            {email.bodyText || '(no content)'}
          </pre>
        </CardContent>
      </Card>

      {email.linkedRecordId && RECORD_LINKS[email.classification] ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            A record was automatically created from this email.
          </p>
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href={RECORD_LINKS[email.classification](email.linkedRecordId)} className="flex items-center gap-1.5">
                {RECORD_LINKS[email.classification](email.linkedRecordId).label}
                <ArrowRight className="size-4" />
              </Link>
            }
          />
        </div>
      ) : email.status !== 'handled' ? (
        <ReplyForm emailId={email.id} defaultSubject={email.subject} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">This email has been handled.</p>
      )}
    </div>
  )
}
