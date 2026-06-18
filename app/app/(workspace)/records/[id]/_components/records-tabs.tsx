'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  User,
  Phone,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  Send,
  Paperclip,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  History,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import type { FoiaRequest } from '@/lib/data'
import type { FoiaThreadMessage, RecordsDocument, AuditLogEntry } from '@/lib/db/mappers'

// ---------------------------------------------------------------------------
// Priority badge
// ---------------------------------------------------------------------------

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority || priority === 'normal') return null
  const styles =
    priority === 'expedited'
      ? 'bg-destructive/10 text-destructive'
      : 'bg-warning/15 text-warning-foreground'
  const label = priority === 'expedited' ? 'Expedited' : 'High priority'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles,
      )}
    >
      <AlertTriangle className="size-3" aria-hidden />
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
}) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" /> {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status select options
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'denied', label: 'Denied' },
  { value: 'withdrawn', label: 'Withdrawn' },
] as const

// ---------------------------------------------------------------------------
// Source / format / delivery display helpers
// ---------------------------------------------------------------------------

function capitalize(s?: string | null) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

// ---------------------------------------------------------------------------
// TAB 1 — Overview
// ---------------------------------------------------------------------------

function OverviewTab({
  requestId,
  request,
}: {
  requestId: string
  request: FoiaRequest
}) {
  const router = useRouter()
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [statusSaving, setStatusSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNotesBlur = useCallback(
    async (e: React.FocusEvent<HTMLTextAreaElement>) => {
      const notes = e.target.value
      if (notes === (request.internalNotes ?? '')) return
      if (timerRef.current) clearTimeout(timerRef.current)
      setSaveState('saving')
      await fetch(`/api/app/records/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: notes }),
      })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    },
    [requestId, request.internalNotes],
  )

  const handleNotesChange = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSaveState('saving')
    timerRef.current = setTimeout(() => setSaveState('idle'), 600)
  }, [])

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value
    setStatusSaving(true)
    await fetch(`/api/app/records/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setStatusSaving(false)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Left: requester + description */}
      <div className="space-y-5 lg:col-span-3">
        {/* Requester card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Requester
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {request.isAnonymous ? (
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Anonymous</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  Identity withheld
                </span>
              </div>
            ) : (
              <DetailRow icon={User} label="Name" value={request.requester} />
            )}
            {request.requesterPhone && (
              <DetailRow icon={Phone} label="Phone" value={request.requesterPhone} />
            )}
            {request.requesterOrg && (
              <DetailRow icon={Building2} label="Organization" value={request.requesterOrg} />
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Request description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {request.summary || 'No description provided.'}
            </p>
            {(request.dateRangeFrom || request.dateRangeTo) && (
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium">Date range:</span>{' '}
                {request.dateRangeFrom ?? '—'} to {request.dateRangeTo ?? '—'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Internal notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Internal notes
              <span className="ml-2 text-xs font-normal normal-case text-muted-foreground/60">
                (not shared with requester)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <Textarea
              defaultValue={request.internalNotes ?? ''}
              onBlur={handleNotesBlur}
              onChange={handleNotesChange}
              placeholder="Add notes for your team — visible to staff only."
              rows={4}
              className="resize-none text-sm"
            />
            <p
              className={cn(
                'text-xs transition-opacity',
                saveState === 'idle' ? 'opacity-0' : 'opacity-100',
                saveState === 'saved' ? 'text-success' : 'text-muted-foreground',
              )}
            >
              {saveState === 'saving' ? 'Saving…' : 'Saved'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right: request details + status */}
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Request details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <DetailRow icon={CalendarDays} label="Received" value={request.received} />
            <DetailRow
              icon={Clock}
              label="Deadline"
              value={
                request.daysRemaining < 0
                  ? `Overdue by ${Math.abs(request.daysRemaining)}d`
                  : request.daysRemaining === 0
                  ? 'Due today'
                  : `${request.daysRemaining} day${request.daysRemaining !== 1 ? 's' : ''} remaining`
              }
            />
            {request.source && (
              <DetailRow icon={FileText} label="Source" value={capitalize(request.source)} />
            )}
            {request.formatRequested && (
              <DetailRow
                icon={FileText}
                label="Format"
                value={capitalize(request.formatRequested)}
              />
            )}
            {request.deliveryMethod && (
              <DetailRow
                icon={Send}
                label="Delivery"
                value={capitalize(request.deliveryMethod)}
              />
            )}
            {request.assignedTo && (
              <DetailRow icon={User} label="Assigned to" value={request.assignedTo} />
            )}
          </CardContent>
        </Card>

        {/* Priority */}
        {request.priority && request.priority !== 'normal' && (
          <Card>
            <CardContent className="pt-4">
              <PriorityBadge priority={request.priority} />
            </CardContent>
          </Card>
        )}

        {/* Status control */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="relative">
              <select
                defaultValue={request.status.replace('-', '_')}
                onChange={handleStatusChange}
                disabled={statusSaving}
                aria-label="Change request status"
                className={cn(
                  'h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none',
                  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
                  statusSaving && 'opacity-60',
                )}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {statusSaving && (
              <p className="text-xs text-muted-foreground">Updating…</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TAB 2 — Correspondence
// ---------------------------------------------------------------------------

function CorrespondenceTab({
  requestId,
  thread: initialThread,
}: {
  requestId: string
  thread: FoiaThreadMessage[]
}) {
  const [thread, setThread] = useState(initialThread)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setError('')
    setSending(true)
    const res = await fetch(`/api/app/records/${requestId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: body.trim(),
        authorName: 'Staff',
        authorRole: 'Town Clerk',
      }),
    })
    setSending(false)
    if (!res.ok) {
      setError('Failed to send message. Please try again.')
      return
    }
    const now = new Date()
    const timeStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    setThread((prev) => [
      ...prev,
      { author: 'Staff', role: 'Town Clerk', time: timeStr, body: body.trim() },
    ])
    setBody('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Correspondence</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {thread.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        )}
        {thread.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg border p-4',
              msg.role === 'Requester'
                ? 'border-border bg-muted/30'
                : 'border-primary/20 bg-primary/5',
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {msg.author}{' '}
                <span className="font-normal text-muted-foreground">· {msg.role}</span>
              </p>
              <span className="text-xs text-muted-foreground">{msg.time}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{msg.body}</p>
          </div>
        ))}

        <Separator />

        <form onSubmit={handleSend} className="space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a reply to the requester…"
            className="min-h-24 resize-none"
            aria-label="Reply to requester"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" size="sm" disabled>
              <Paperclip className="size-4" /> Attach
            </Button>
            <Button type="submit" disabled={sending || !body.trim()}>
              <Send className="size-4" />
              {sending ? 'Sending…' : 'Send reply'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// TAB 3 — Documents
// ---------------------------------------------------------------------------

function DocumentsTab({
  requestId,
  documents: initialDocuments,
}: {
  requestId: string
  documents: RecordsDocument[]
}) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [showForm, setShowForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')

  function formatFileSize(bytes?: number) {
    if (!bytes) return null
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleAddDocument(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    setAdding(true)
    const form = new FormData(e.currentTarget)
    const name = (form.get('name') as string).trim()
    const fileUrl = (form.get('fileUrl') as string).trim()

    if (!name || !fileUrl) {
      setFormError('Name and URL are required.')
      setAdding(false)
      return
    }

    const res = await fetch(`/api/app/records/${requestId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, fileUrl }),
    })
    setAdding(false)
    if (!res.ok) {
      setFormError('Failed to add document. Please try again.')
      return
    }
    const data = await res.json() as { document?: RecordsDocument }
    if (data.document) {
      setDocuments((prev) => [...prev, data.document!])
    }
    setShowForm(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Documents</CardTitle>
        {!showForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="size-4" /> Add document
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">
            No documents attached yet. Add the first document to get started.
          </p>
        )}

        {documents.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-start gap-3 px-4 py-3">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary underline-offset-3 hover:underline"
                  >
                    {doc.name}
                  </a>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {doc.uploadedBy}
                    {doc.fileSize ? ` · ${formatFileSize(doc.fileSize)}` : ''}
                    {` · ${doc.createdAt}`}
                  </p>
                </div>
                {doc.isRedacted && (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Redacted
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {showForm && (
          <form
            onSubmit={handleAddDocument}
            className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Add document
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="doc-name">Document name</Label>
              <Input
                id="doc-name"
                name="name"
                required
                placeholder="e.g. Police report FOIA-2026-1042.pdf"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-url">File URL</Label>
              <Input
                id="doc-url"
                name="fileUrl"
                type="url"
                required
                placeholder="https://…"
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={adding}>
                {adding ? 'Adding…' : 'Add document'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  setFormError('')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// TAB 4 — Fulfill / Deny
// ---------------------------------------------------------------------------

function FulfillDenyTab({
  requestId,
  request,
}: {
  requestId: string
  request: FoiaRequest
}) {
  const router = useRouter()
  const [fulfilling, setFulfilling] = useState(false)
  const [denying, setDenying] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [denyReason, setDenyReason] = useState('')
  const [error, setError] = useState('')
  const [showDenyForm, setShowDenyForm] = useState(false)
  const [confirmFulfill, setConfirmFulfill] = useState(false)

  if (request.status === 'complete') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-success">
            <CheckCircle2 className="size-6" />
            <div>
              <p className="font-semibold">Fulfilled</p>
              {request.fulfilledAt && (
                <p className="text-sm text-muted-foreground">
                  Records released on {request.fulfilledAt}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (request.status === 'denied') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-destructive">
            <XCircle className="mt-0.5 size-6 shrink-0" />
            <div>
              <p className="font-semibold">Request denied</p>
              {request.deniedAt && (
                <p className="text-sm text-muted-foreground">
                  Denied on {request.deniedAt}
                </p>
              )}
              {request.denialReason && (
                <p className="mt-2 text-sm text-foreground/80">{request.denialReason}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  async function handleFulfill() {
    setError('')
    setFulfilling(true)
    const res = await fetch(`/api/app/records/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fulfill' }),
    })
    setFulfilling(false)
    if (!res.ok) {
      setError('Failed to mark as fulfilled. Please try again.')
      return
    }
    router.refresh()
  }

  async function handleDeny(e: React.FormEvent) {
    e.preventDefault()
    if (!denyReason.trim()) return
    setError('')
    setDenying(true)
    const res = await fetch(`/api/app/records/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deny', reason: denyReason.trim() }),
    })
    setDenying(false)
    if (!res.ok) {
      setError('Failed to deny request. Please try again.')
      return
    }
    router.refresh()
  }

  async function handleWithdraw() {
    setError('')
    setWithdrawing(true)
    await fetch(`/api/app/records/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'withdrawn' }),
    })
    setWithdrawing(false)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Fulfill card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" />
              <CardTitle className="text-base">Fulfill request</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mark this request as fulfilled once records have been released to the requester.
            </p>
            {!confirmFulfill ? (
              <Button
                className="w-full bg-success text-white hover:bg-success/90"
                onClick={() => setConfirmFulfill(true)}
              >
                <CheckCircle2 className="size-4" /> Mark as fulfilled
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-3">
                <p className="text-sm font-medium text-foreground">
                  Confirm: records have been released?
                </p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-success text-white hover:bg-success/90"
                    disabled={fulfilling}
                    onClick={handleFulfill}
                  >
                    {fulfilling ? 'Saving…' : 'Yes, confirm'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmFulfill(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deny card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="size-5 text-destructive" />
              <CardTitle className="text-base">Deny request</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deny the request and provide a reason. The requester will be notified.
            </p>
            {!showDenyForm ? (
              <Button
                variant="outline"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/5"
                onClick={() => setShowDenyForm(true)}
              >
                <XCircle className="size-4" /> Deny request
              </Button>
            ) : (
              <form onSubmit={handleDeny} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="deny-reason">Reason for denial</Label>
                  <Textarea
                    id="deny-reason"
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                    placeholder="Cite the applicable exemption or reason…"
                    rows={4}
                    className="resize-none"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={denying || !denyReason.trim()}
                  >
                    {denying ? 'Saving…' : 'Confirm denial'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowDenyForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdraw */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Requester withdrew the request?
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={withdrawing}
          onClick={handleWithdraw}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          {withdrawing ? 'Saving…' : 'Mark as withdrawn'}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TAB 5 — Audit Log
// ---------------------------------------------------------------------------

const AUDIT_ACTION_LABELS: Record<string, string> = {
  created: 'Request created',
  status_changed: 'Status updated',
  message_sent: 'Message sent',
  document_added: 'Document added',
  fulfilled: 'Request fulfilled',
  denied: 'Request denied',
  withdrawn: 'Request withdrawn',
  assigned: 'Assignee changed',
  notes_updated: 'Notes updated',
}

function auditActionLabel(action: string) {
  return AUDIT_ACTION_LABELS[action] ?? action.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

function AuditLogTab({ auditLog }: { auditLog: AuditLogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Audit log</CardTitle>
      </CardHeader>
      <CardContent>
        {auditLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
        ) : (
          <ol className="relative space-y-0 border-l border-border pl-5">
            {auditLog.map((entry, i) => (
              <li key={entry.id ?? i} className="relative pb-6 last:pb-0">
                {/* Timeline dot */}
                <span className="absolute -left-[17px] top-1 flex size-[9px] items-center justify-center rounded-full border border-border bg-background" />
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {auditActionLabel(entry.action)}
                    </p>
                    <span className="text-xs text-muted-foreground">{entry.createdAt}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entry.actorName}
                    {entry.actorRole ? ` · ${entry.actorRole}` : ''}
                  </p>
                  {entry.detail && (
                    <p className="mt-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {entry.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main RecordsTabs component
// ---------------------------------------------------------------------------

export type RecordsTabsProps = {
  requestId: string
  request: FoiaRequest
  thread: FoiaThreadMessage[]
  documents: RecordsDocument[]
  auditLog: AuditLogEntry[]
}

const VALID_TABS = ['overview', 'correspondence', 'documents', 'fulfill', 'audit'] as const
type TabValue = (typeof VALID_TABS)[number]

export function RecordsTabs({
  requestId,
  request,
  thread,
  documents,
  auditLog,
}: RecordsTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawTab = searchParams.get('tab') ?? 'overview'
  const activeTab: TabValue = (VALID_TABS as readonly string[]).includes(rawTab)
    ? (rawTab as TabValue)
    : 'overview'

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'overview') {
      params.delete('tab')
    } else {
      params.set('tab', value)
    }
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="correspondence">
          Correspondence
          {thread.length > 0 && (
            <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
              {thread.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="documents">
          Documents
          {documents.length > 0 && (
            <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
              {documents.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="fulfill">Fulfill / Deny</TabsTrigger>
        <TabsTrigger value="audit">
          <History className="size-3.5" />
          Audit log
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-5">
        <OverviewTab requestId={requestId} request={request} />
      </TabsContent>

      <TabsContent value="correspondence" className="mt-5">
        <CorrespondenceTab requestId={requestId} thread={thread} />
      </TabsContent>

      <TabsContent value="documents" className="mt-5">
        <DocumentsTab requestId={requestId} documents={documents} />
      </TabsContent>

      <TabsContent value="fulfill" className="mt-5">
        <FulfillDenyTab requestId={requestId} request={request} />
      </TabsContent>

      <TabsContent value="audit" className="mt-5">
        <AuditLogTab auditLog={auditLog} />
      </TabsContent>
    </Tabs>
  )
}
