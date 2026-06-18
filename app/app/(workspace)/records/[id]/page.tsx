import { notFound } from 'next/navigation'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import {
  getFoiaRequest,
  getFoiaThread,
  getFoiaDocuments,
  getFoiaAuditLog,
} from '@/lib/server/data'
import { RecordsTabs } from './_components/records-tabs'

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const req = await getFoiaRequest(id)
  if (!req) notFound()

  const [thread, documents, auditLog] = await Promise.all([
    getFoiaThread(id),
    getFoiaDocuments(id),
    getFoiaAuditLog(id),
  ])

  const isOverdue = req.status === 'overdue'
  const isDueSoon = req.status === 'due-soon'

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={req.title}
        description={`Received ${req.received}${req.requester ? ` · ${req.requester}` : ''}`}
        breadcrumbs={[
          { label: 'Records Requests', href: '/app/records' },
          { label: req.id },
        ]}
        actions={<StatusPill status={req.status} />}
      />

      {isOverdue && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-destructive">Response is overdue</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {req.daysRemaining < 0
                ? `${Math.abs(req.daysRemaining)} day${Math.abs(req.daysRemaining) !== 1 ? 's' : ''} past the statutory deadline.`
                : 'Deadline has passed.'}{' '}
              Release records, send a status update, or deny the request.
            </p>
          </div>
        </div>
      )}

      {isDueSoon && !isOverdue && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning-foreground" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-warning-foreground">Response due soon</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {req.daysRemaining === 1
                ? 'Due in 1 day.'
                : `Due in ${req.daysRemaining} days.`}{' '}
              Take action before the deadline passes.
            </p>
          </div>
        </div>
      )}

      <RecordsTabs
        requestId={id}
        request={req}
        thread={thread}
        documents={documents}
        auditLog={auditLog}
      />
    </div>
  )
}
