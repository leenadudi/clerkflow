'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Check, Send, Sparkles, Loader2, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import type { Motion, MeetingActionItem, MeetingAttendance } from '@/lib/data'

// Extended AgendaItem — includes id and meetingId added by getFullMeeting
type AgendaItem = {
  id: string
  n: number
  title: string
  detail: string
  notes: string
  meetingId: string
}

// ---------- Outcome badge ----------

const OUTCOME_STYLES: Record<string, string> = {
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  tabled: 'bg-amber-100 text-amber-800',
  pending: 'bg-slate-100 text-slate-700',
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const cls = OUTCOME_STYLES[outcome] ?? OUTCOME_STYLES.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {outcome}
    </span>
  )
}

// ---------- Autosave textarea ----------

function AutosaveTextarea({
  defaultValue,
  meetingId,
  itemId,
}: {
  defaultValue: string
  meetingId: string
  itemId: string
}) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const notes = e.target.value
      if (timerRef.current) clearTimeout(timerRef.current)
      setSaveState('saving')
      timerRef.current = setTimeout(async () => {
        await fetch(`/api/app/meetings/${meetingId}/agenda/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        })
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      }, 800)
    },
    [meetingId, itemId],
  )

  return (
    <div className="space-y-1">
      <Textarea
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Notes for this item…"
        rows={3}
        className="text-sm"
      />
      {saveState === 'saving' && (
        <p className="text-xs text-muted-foreground">Saving…</p>
      )}
      {saveState === 'saved' && (
        <p className="text-xs text-green-600">Saved</p>
      )}
    </div>
  )
}

// ---------- Record motion form (inline) ----------

function RecordMotionForm({
  meetingId,
  agendaItemId,
  onDone,
}: {
  meetingId: string
  agendaItemId?: string
  onDone: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const body = {
      agendaItemId: agendaItemId ?? null,
      description: form.get('description'),
      movedBy: form.get('movedBy'),
      secondedBy: form.get('secondedBy'),
      voteYes: Number(form.get('voteYes') ?? 0),
      voteNo: Number(form.get('voteNo') ?? 0),
      voteAbstain: Number(form.get('voteAbstain') ?? 0),
      outcome: form.get('outcome'),
    }
    const res = await fetch(`/api/app/meetings/${meetingId}/motions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!res.ok) {
      setError('Failed to save motion.')
      return
    }
    onDone()
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-lg border border-border bg-muted/30 p-4 space-y-3"
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Record motion
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          required
          placeholder="e.g. Move to approve Resolution 2026-14"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="movedBy">Moved by</Label>
          <Input id="movedBy" name="movedBy" placeholder="Name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="secondedBy">Seconded by</Label>
          <Input id="secondedBy" name="secondedBy" placeholder="Name" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="voteYes">Yes</Label>
          <Input id="voteYes" name="voteYes" type="number" min={0} defaultValue={0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="voteNo">No</Label>
          <Input id="voteNo" name="voteNo" type="number" min={0} defaultValue={0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="voteAbstain">Abstain</Label>
          <Input id="voteAbstain" name="voteAbstain" type="number" min={0} defaultValue={0} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="outcome">Outcome</Label>
        <select
          id="outcome"
          name="outcome"
          defaultValue="pending"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="pending">Pending</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="tabled">Tabled</option>
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Saving…' : 'Save motion'}
        </Button>
      </div>
    </form>
  )
}

// ---------- Agenda tab ----------

const TEMPLATE_CHIPS = [
  'Call to order',
  'Approval of prior minutes',
  'Public comment',
  'Old business',
  'New business',
  'Adjournment',
]

function AgendaTab({
  meetingId,
  agenda,
}: {
  meetingId: string
  agenda: AgendaItem[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  async function addItem(title: string, detail = '') {
    setAddLoading(true)
    await fetch(`/api/app/meetings/${meetingId}/agenda`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, detail }),
    })
    setAddLoading(false)
    setShowAddForm(false)
    router.refresh()
  }

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await addItem(form.get('title') as string, form.get('detail') as string)
  }

  async function handleEditSubmit(
    e: React.FormEvent<HTMLFormElement>,
    itemId: string,
  ) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await fetch(`/api/app/meetings/${meetingId}/agenda/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        detail: form.get('detail'),
      }),
    })
    setEditingId(null)
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {agenda.map((item) => (
            <li key={item.id} className="px-5 py-4">
              {editingId === item.id ? (
                <form
                  onSubmit={(e) => handleEditSubmit(e, item.id)}
                  className="space-y-2"
                >
                  <Input
                    name="title"
                    defaultValue={item.title}
                    required
                    placeholder="Item title"
                    autoFocus
                  />
                  <Input
                    name="detail"
                    defaultValue={item.detail}
                    placeholder="Detail (optional)"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      <Check className="size-3" /> Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-4">
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                    {item.n}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.detail ? (
                      <p className="text-xs text-muted-foreground">
                        {item.detail}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Pencil className="size-3" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="border-t border-border p-4 space-y-3">
          {/* Template chips */}
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={addLoading}
                onClick={() => addItem(chip)}
                className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
              >
                + {chip}
              </button>
            ))}
          </div>

          {showAddForm ? (
            <form onSubmit={handleAddSubmit} className="space-y-2 pt-1">
              <Input name="title" required placeholder="Item title" autoFocus />
              <Input name="detail" placeholder="Detail (optional)" />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={addLoading}>
                  {addLoading ? 'Adding…' : 'Add item'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="size-4" /> Add agenda item
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------- Minutes tab ----------

function MinutesTab({
  meetingId,
  agenda,
  motions,
  presidingOfficer: initialPresidingOfficer,
  minutesDraft: initialMinutesDraft,
}: {
  meetingId: string
  agenda: AgendaItem[]
  motions: Motion[]
  presidingOfficer: string
  minutesDraft?: string
}) {
  const router = useRouter()
  const [showMotionFor, setShowMotionFor] = useState<string | 'standalone' | null>(null)
  const [presidingOfficer, setPresidingOfficer] = useState(initialPresidingOfficer)
  const [calledToOrderAt, setCalledToOrderAt] = useState('')
  const [adjournedAt, setAdjournedAt] = useState('')
  const [draftText, setDraftText] = useState(initialMinutesDraft ?? '')
  const [generating, setGenerating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(false)

  const motionsByItem = motions.reduce<Record<string, Motion[]>>((acc, m) => {
    const key = m.agendaItemId ?? '__unlinked__'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const hasAnyNotes = agenda.some((item) => item.notes && item.notes.trim().length > 0)

  async function patchMeeting(body: Record<string, unknown>) {
    await fetch(`/api/app/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  async function handleGenerateDraft() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/app/meetings/${meetingId}/generate-draft`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json() as { draft?: string }
        if (data.draft) {
          setDraftText(data.draft)
        }
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleApproveMminutes() {
    const confirmed = window.confirm(
      'Approving minutes finalizes the record. This cannot be undone.',
    )
    if (!confirmed) return
    setApproving(true)
    await patchMeeting({ action: 'approve-minutes' })
    setApproving(false)
    setApproved(true)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Meeting header fields */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="presidingOfficer">Presiding officer</Label>
            <Input
              id="presidingOfficer"
              value={presidingOfficer}
              onChange={(e) => setPresidingOfficer(e.target.value)}
              onBlur={() => patchMeeting({ presidingOfficer })}
              placeholder="Mayor R. Coleman"
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="calledToOrderAt">Called to order</Label>
              <Input
                id="calledToOrderAt"
                type="time"
                value={calledToOrderAt}
                onChange={(e) => setCalledToOrderAt(e.target.value)}
                onBlur={() => patchMeeting({ calledToOrderAt })}
                className="w-36"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adjournedAt">Adjourned at</Label>
              <Input
                id="adjournedAt"
                type="time"
                value={adjournedAt}
                onChange={(e) => setAdjournedAt(e.target.value)}
                onBlur={() => patchMeeting({ adjournedAt })}
                className="w-36"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate draft button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerateDraft}
          disabled={!hasAnyNotes || generating}
          variant="outline"
        >
          {generating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate draft minutes
            </>
          )}
        </Button>
        {!hasAnyNotes && (
          <p className="text-xs text-muted-foreground">
            Add notes to agenda items below before generating a draft.
          </p>
        )}
      </div>

      {/* Draft panel */}
      {draftText && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Draft minutes</p>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Draft — not approved
              </span>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Draft textarea — 60% */}
              <div className="flex-[3] space-y-2">
                <Textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onBlur={() => patchMeeting({ minutesDraft: draftText })}
                  rows={20}
                  className="text-sm font-mono"
                  placeholder="Draft minutes text…"
                />
              </div>
              {/* Notes reference — 40% */}
              <div className="flex-[2] space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes for reference
                </p>
                <div className="max-h-[480px] overflow-y-auto space-y-3 pr-1">
                  {agenda.map((item) =>
                    item.notes ? (
                      <div key={item.id} className="space-y-1">
                        <p className="text-xs font-medium text-foreground">
                          {item.n}. {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {item.notes}
                        </p>
                      </div>
                    ) : null,
                  )}
                  {!agenda.some((i) => i.notes) && (
                    <p className="text-xs text-muted-foreground">No notes recorded.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Approve button */}
            {approved ? (
              <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                <Check className="size-4" /> Minutes approved
              </div>
            ) : (
              <Button
                onClick={handleApproveMminutes}
                disabled={approving}
                className="bg-green-700 text-white hover:bg-green-800"
              >
                {approving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Approving…
                  </>
                ) : (
                  'Approve minutes'
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Per-item notes */}
      {agenda.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              {item.n}. {item.title}
            </p>
            <AutosaveTextarea
              defaultValue={item.notes}
              meetingId={meetingId}
              itemId={item.id}
            />

            {/* Motions linked to this item */}
            {(motionsByItem[item.id] ?? []).map((motion) => (
              <div
                key={motion.id}
                className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{motion.description}</p>
                  <OutcomeBadge outcome={motion.outcome} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Moved by {motion.movedBy} · Seconded by {motion.secondedBy}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Vote: {motion.voteYes} yes · {motion.voteNo} no · {motion.voteAbstain} abstain
                </p>
              </div>
            ))}

            {showMotionFor === item.id ? (
              <RecordMotionForm
                meetingId={meetingId}
                agendaItemId={item.id}
                onDone={() => setShowMotionFor(null)}
              />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMotionFor(item.id)}
              >
                <Plus className="size-4" /> Record motion
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Unlinked motions */}
      {(motionsByItem['__unlinked__'] ?? []).length > 0 && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Other motions
            </p>
            {(motionsByItem['__unlinked__'] ?? []).map((motion) => (
              <div
                key={motion.id}
                className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{motion.description}</p>
                  <OutcomeBadge outcome={motion.outcome} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Moved by {motion.movedBy} · Seconded by {motion.secondedBy}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Vote: {motion.voteYes} yes · {motion.voteNo} no · {motion.voteAbstain} abstain
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Standalone motion button */}
      <Card>
        <CardContent className="p-4">
          {showMotionFor === 'standalone' ? (
            <RecordMotionForm
              meetingId={meetingId}
              onDone={() => setShowMotionFor(null)}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMotionFor('standalone')}
            >
              <Plus className="size-4" /> Record motion (not linked to item)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* All motions summary */}
      {motions.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              All motions
            </p>
            <div className="space-y-2">
              {motions.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-foreground">{m.description}</span>
                  <OutcomeBadge outcome={m.outcome} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ---------- Attendance tab ----------

const STATUS_OPTIONS: Array<{ value: MeetingAttendance['status']; label: string }> = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
  { value: 'late', label: 'Arrived late' },
  { value: 'early', label: 'Left early' },
]

const STATUS_BUTTON_STYLES: Record<MeetingAttendance['status'], string> = {
  present: 'bg-green-100 text-green-800 border-green-300',
  absent: 'bg-red-100 text-red-800 border-red-300',
  excused: 'bg-slate-100 text-slate-700 border-slate-300',
  late: 'bg-amber-100 text-amber-800 border-amber-300',
  early: 'bg-amber-100 text-amber-800 border-amber-300',
}

function AttendeeRow({
  attendee,
  meetingId,
  onUpdate,
}: {
  attendee: MeetingAttendance
  meetingId: string
  onUpdate: (id: string, updates: Partial<MeetingAttendance>) => void
}) {
  const [status, setStatus] = useState(attendee.status)
  const [arrivedAt, setArrivedAt] = useState(attendee.arrivedAt ?? '')
  const [leftAt, setLeftAt] = useState(attendee.leftAt ?? '')
  const [saving, setSaving] = useState(false)

  async function patchAttendee(updates: { status?: string; arrivedAt?: string; leftAt?: string }) {
    setSaving(true)
    await fetch(`/api/app/meetings/${meetingId}/attendance/${attendee.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setSaving(false)
  }

  async function handleStatusChange(newStatus: MeetingAttendance['status']) {
    setStatus(newStatus)
    onUpdate(attendee.id, { status: newStatus })
    await patchAttendee({ status: newStatus })
  }

  return (
    <li className="flex flex-wrap items-start gap-3 px-5 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{attendee.name}</p>
        <p className="text-xs text-muted-foreground">
          {attendee.role}
          {attendee.isGuest && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
              Guest
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={saving}
            onClick={() => handleStatusChange(opt.value)}
            className={[
              'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity',
              status === opt.value
                ? STATUS_BUTTON_STYLES[opt.value]
                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
              saving ? 'opacity-50' : '',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {status === 'late' && (
        <div className="flex items-center gap-2 w-full pl-0 sm:w-auto sm:pl-0">
          <Label htmlFor={`arrived-${attendee.id}`} className="text-xs shrink-0">
            Arrived at:
          </Label>
          <Input
            id={`arrived-${attendee.id}`}
            type="time"
            value={arrivedAt}
            onChange={(e) => setArrivedAt(e.target.value)}
            onBlur={() => patchAttendee({ arrivedAt })}
            className="h-7 w-28 text-xs"
          />
        </div>
      )}
      {status === 'early' && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label htmlFor={`left-${attendee.id}`} className="text-xs shrink-0">
            Left at:
          </Label>
          <Input
            id={`left-${attendee.id}`}
            type="time"
            value={leftAt}
            onChange={(e) => setLeftAt(e.target.value)}
            onBlur={() => patchAttendee({ leftAt })}
            className="h-7 w-28 text-xs"
          />
        </div>
      )}
    </li>
  )
}

function AttendanceTab({
  meetingId,
  initialAttendance,
}: {
  meetingId: string
  initialAttendance: MeetingAttendance[]
}) {
  const router = useRouter()
  const [attendance, setAttendance] = useState(initialAttendance)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  function handleUpdate(id: string, updates: Partial<MeetingAttendance>) {
    setAttendance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    )
  }

  // Quorum calculation: non-guest attendees with status present or late
  const votingMembers = attendance.filter((a) => !a.isGuest)
  const presentCount = votingMembers.filter(
    (a) => a.status === 'present' || a.status === 'late',
  ).length
  const totalVoting = votingMembers.length
  const quorumMet = presentCount > totalVoting / 2

  async function handleAddAttendee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddLoading(true)
    const form = new FormData(e.currentTarget)
    await fetch(`/api/app/meetings/${meetingId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        role: form.get('role'),
        isGuest: form.get('isGuest') === 'on',
      }),
    })
    setAddLoading(false)
    setShowAddForm(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Quorum indicator */}
      <div className="flex items-center gap-2">
        <span
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
            quorumMet
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800',
          ].join(' ')}
        >
          {quorumMet ? <Check className="size-3.5" /> : <span className="size-3.5 inline-flex items-center justify-center font-bold">✗</span>}
          Quorum: {presentCount} of {totalVoting} present
          {quorumMet ? ' — met' : ' — not met'}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {attendance.map((attendee) => (
              <AttendeeRow
                key={attendee.id}
                attendee={attendee}
                meetingId={meetingId}
                onUpdate={handleUpdate}
              />
            ))}
          </ul>

          <div className="border-t border-border p-4">
            {showAddForm ? (
              <form onSubmit={handleAddAttendee} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input name="name" required placeholder="Name" autoFocus />
                  <Input name="role" placeholder="Role (optional)" />
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" name="isGuest" className="rounded border-border" />
                  Add as guest
                </label>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={addLoading}>
                    {addLoading ? 'Adding…' : 'Add attendee'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="size-4" /> Add attendee
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- Action Items tab ----------

function ActionItemsTab({
  meetingId,
  actionItems,
}: {
  meetingId: string
  actionItems: MeetingActionItem[]
}) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  async function toggleDone(item: MeetingActionItem) {
    setToggling(item.id)
    await fetch(`/api/app/meetings/${meetingId}/action-items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !item.done }),
    })
    setToggling(null)
    router.refresh()
  }

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddLoading(true)
    const form = new FormData(e.currentTarget)
    await fetch(`/api/app/meetings/${meetingId}/action-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        assignedTo: form.get('assignedTo') || undefined,
        dueDate: form.get('dueDate') || undefined,
      }),
    })
    setAddLoading(false)
    setShowAddForm(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-0">
          {actionItems.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              No action items yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {actionItems.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-5 py-4">
                  <button
                    type="button"
                    disabled={toggling === item.id}
                    onClick={() => toggleDone(item)}
                    className={[
                      'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                      item.done
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-border bg-transparent hover:border-primary',
                      toggling === item.id ? 'opacity-50' : '',
                    ].join(' ')}
                    aria-label={item.done ? 'Mark incomplete' : 'Mark done'}
                  >
                    {item.done && <Check className="size-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${item.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                    >
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.assignedTo}
                      {item.dueDate ? ` · Due ${item.dueDate}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border p-4">
            {showAddForm ? (
              <form onSubmit={handleAddSubmit} className="space-y-2">
                <Input name="title" required placeholder="Action item" autoFocus />
                <div className="grid grid-cols-2 gap-2">
                  <Input name="assignedTo" placeholder="Assigned to (optional)" />
                  <Input name="dueDate" type="date" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={addLoading}>
                    {addLoading ? 'Adding…' : 'Add item'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="size-4" /> Add action item
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- Publish tab ----------

function PublishTab({
  meetingId,
  status,
  minutesStatus,
  agendaPublishedAt,
  minutesDraft,
  townSlug,
  residentHubEnabled,
}: {
  meetingId: string
  status: string
  minutesStatus: string
  agendaPublishedAt?: string
  minutesDraft?: string
  townSlug?: string
  residentHubEnabled?: boolean
}) {
  const router = useRouter()
  const [publishingAgenda, setPublishingAgenda] = useState(false)
  const [publishingMinutes, setPublishingMinutes] = useState(false)
  const [agendaPublished, setAgendaPublished] = useState(!!agendaPublishedAt)
  const [agendaPublishedDate, setAgendaPublishedDate] = useState(agendaPublishedAt)
  const [minutesPublished, setMinutesPublished] = useState(status === 'published')

  async function handlePublishAgenda() {
    setPublishingAgenda(true)
    const res = await fetch(`/api/app/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish-agenda' }),
    })
    setPublishingAgenda(false)
    if (res.ok) {
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      setAgendaPublished(true)
      setAgendaPublishedDate(now)
      router.refresh()
    }
  }

  async function handlePublishMinutes() {
    setPublishingMinutes(true)
    const res = await fetch(`/api/app/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish' }),
    })
    setPublishingMinutes(false)
    if (res.ok) {
      setMinutesPublished(true)
      router.refresh()
    }
  }

  const minutesApproved = minutesStatus === 'approved'
  const showResidentHubLinks = residentHubEnabled && townSlug

  return (
    <div className="space-y-4">
      {/* Agenda section */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Agenda</p>
          {agendaPublished ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                <Check className="size-4" />
                Agenda published{agendaPublishedDate ? ` ${agendaPublishedDate}` : ''}
              </div>
              <div className="flex flex-wrap gap-2">
                {showResidentHubLinks && (
                  <a
                    href={`/${townSlug}/meetings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline-offset-3 hover:underline"
                  >
                    View public agenda <ExternalLink className="size-3" />
                  </a>
                )}
                <a
                  href={`/api/app/meetings/${meetingId}/print?print=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-3 hover:underline hover:text-foreground"
                >
                  <FileText className="size-3" /> Export agenda PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {residentHubEnabled && (
                <Button onClick={handlePublishAgenda} disabled={publishingAgenda}>
                  <Send className="size-4" />
                  {publishingAgenda ? 'Publishing…' : 'Publish agenda to resident hub'}
                </Button>
              )}
              <a
                href={`/api/app/meetings/${meetingId}/print?print=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-3 hover:underline hover:text-foreground"
              >
                <FileText className="size-3" /> Export agenda PDF
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minutes section */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Minutes</p>
          {minutesPublished ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                <Check className="size-4" /> Minutes published
              </div>
              <div className="flex flex-wrap gap-2">
                {showResidentHubLinks && (
                  <a
                    href={`/${townSlug}/meetings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline-offset-3 hover:underline"
                  >
                    View public minutes <ExternalLink className="size-3" />
                  </a>
                )}
                <a
                  href={`/api/app/meetings/${meetingId}/print?type=minutes&print=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-3 hover:underline hover:text-foreground"
                >
                  <FileText className="size-3" /> Export minutes PDF
                </a>
              </div>
            </div>
          ) : minutesApproved ? (
            <div className="flex flex-wrap items-center gap-3">
              {residentHubEnabled && (
                <Button onClick={handlePublishMinutes} disabled={publishingMinutes}>
                  <Send className="size-4" />
                  {publishingMinutes ? 'Publishing…' : 'Publish minutes to resident hub'}
                </Button>
              )}
              <a
                href={`/api/app/meetings/${meetingId}/print?type=minutes&print=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-3 hover:underline hover:text-foreground"
              >
                <FileText className="size-3" /> Export minutes PDF
              </a>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled title="Approve minutes first">
                <Send className="size-4" />
                Publish minutes
              </Button>
              <p className="text-xs text-muted-foreground">Approve minutes first</p>
              {minutesDraft && (
                <a
                  href={`/api/app/meetings/${meetingId}/print?type=minutes&print=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-3 hover:underline hover:text-foreground"
                >
                  <FileText className="size-3" /> Export draft PDF
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- Main MeetingTabs component ----------

export type MeetingTabsProps = {
  meetingId: string
  agenda: AgendaItem[]
  motions: Motion[]
  actionItems: MeetingActionItem[]
  attendance: MeetingAttendance[]
  status: string
  minutesStatus: string
  agendaPublishedAt?: string
  minutesDraft?: string
  presidingOfficer: string
  townSlug?: string
  residentHubEnabled?: boolean
}

export function MeetingTabs({
  meetingId,
  agenda,
  motions,
  actionItems,
  attendance,
  status,
  minutesStatus,
  agendaPublishedAt,
  minutesDraft,
  presidingOfficer,
  townSlug,
  residentHubEnabled,
}: MeetingTabsProps) {
  return (
    <Tabs defaultValue="agenda" className="mt-6">
      <TabsList>
        <TabsTrigger value="agenda">Agenda</TabsTrigger>
        <TabsTrigger value="minutes">Minutes</TabsTrigger>
        <TabsTrigger value="attendance">
          Attendance ({attendance.length})
        </TabsTrigger>
        <TabsTrigger value="actions">Action items</TabsTrigger>
        <TabsTrigger value="publish">Publish</TabsTrigger>
      </TabsList>

      <TabsContent value="agenda" className="mt-4">
        <AgendaTab meetingId={meetingId} agenda={agenda} />
      </TabsContent>

      <TabsContent value="minutes" className="mt-4">
        <MinutesTab
          meetingId={meetingId}
          agenda={agenda}
          motions={motions}
          presidingOfficer={presidingOfficer}
          minutesDraft={minutesDraft}
        />
      </TabsContent>

      <TabsContent value="attendance" className="mt-4">
        <AttendanceTab meetingId={meetingId} initialAttendance={attendance} />
      </TabsContent>

      <TabsContent value="actions" className="mt-4">
        <ActionItemsTab meetingId={meetingId} actionItems={actionItems} />
      </TabsContent>

      <TabsContent value="publish" className="mt-4">
        <PublishTab
          meetingId={meetingId}
          status={status}
          minutesStatus={minutesStatus}
          agendaPublishedAt={agendaPublishedAt}
          minutesDraft={minutesDraft}
          townSlug={townSlug}
          residentHubEnabled={residentHubEnabled}
        />
      </TabsContent>
    </Tabs>
  )
}
