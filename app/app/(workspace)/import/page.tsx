'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, CheckCircle2, AlertTriangle,
  RotateCcw, Loader2, ChevronRight, Info,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ParseResult, ImportRecord, DocType } from '@/lib/import/types'

const DOC_TYPE_LABELS: Record<DocType, string> = {
  board_roster: 'Board roster',
  meeting_list: 'Meeting list',
  foia_log: 'FOIA log',
  license_log: 'License log',
  unknown: 'Unknown',
}

const DOC_TYPE_DESTINATIONS: Record<DocType, string> = {
  board_roster: '/app/boards',
  meeting_list: '/app/meetings',
  foia_log: '/app/records',
  license_log: '/app/services',
  unknown: '/app',
}

type Step = 'upload' | 'review' | 'done'

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  if (pct >= 70) return <Badge className="bg-success/15 text-success border-success/20">{pct}% confidence</Badge>
  if (pct >= 40) return <Badge className="bg-warning/15 text-warning-foreground border-warning/30">{pct}% confidence</Badge>
  return <Badge className="bg-destructive/10 text-destructive border-destructive/20">{pct}% confidence</Badge>
}

function RecordField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function RecordRow({
  record, docType, index, onChange, onRemove,
}: {
  record: ImportRecord
  docType: DocType
  index: number
  onChange: (i: number, r: ImportRecord) => void
  onRemove: (i: number) => void
}) {
  const set = (field: keyof ImportRecord) => (v: string) => onChange(index, { ...record, [field]: v })

  return (
    <div className="group relative rounded-lg border border-border bg-card p-3">
      <button
        onClick={() => onRemove(index)}
        className="absolute right-2 top-2 hidden rounded text-muted-foreground hover:text-destructive group-hover:block"
        aria-label="Remove row"
      >
        ✕
      </button>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {docType === 'board_roster' && (
          <>
            <RecordField label="Member name" value={record.memberName ?? ''} onChange={set('memberName')} />
            <RecordField label="Board" value={record.boardName ?? ''} onChange={set('boardName')} />
            <RecordField label="Seat" value={record.seat ?? ''} onChange={set('seat')} />
            <RecordField label="Term expires" value={record.expiresAt ?? ''} onChange={set('expiresAt')} />
          </>
        )}
        {docType === 'meeting_list' && (
          <>
            <RecordField label="Title" value={record.title ?? ''} onChange={set('title')} />
            <RecordField label="Date" value={record.startsAt ?? ''} onChange={set('startsAt')} />
            <RecordField label="Location" value={record.location ?? ''} onChange={set('location')} />
            <RecordField label="Type" value={record.body ?? ''} onChange={set('body')} />
          </>
        )}
        {docType === 'foia_log' && (
          <>
            <RecordField label="Requester" value={record.requesterName ?? ''} onChange={set('requesterName')} />
            <RecordField label="Email" value={record.requesterEmail ?? ''} onChange={set('requesterEmail')} />
            <RecordField label="Summary" value={record.summary ?? ''} onChange={set('summary')} />
            <RecordField label="Received" value={record.receivedAt ?? ''} onChange={set('receivedAt')} />
          </>
        )}
        {docType === 'license_log' && (
          <>
            <RecordField label="Type" value={record.licenseType ?? ''} onChange={set('licenseType')} />
            <RecordField label="Applicant" value={record.applicantName ?? ''} onChange={set('applicantName')} />
            <RecordField label="Email" value={record.applicantEmail ?? ''} onChange={set('applicantEmail')} />
            <RecordField label="Submitted" value={record.submittedAt ?? ''} onChange={set('submittedAt')} />
          </>
        )}
      </div>
    </div>
  )
}

export default function ImportPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [parsing, setParsing] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [records, setRecords] = useState<ImportRecord[]>([])
  const [fileName, setFileName] = useState('')
  const [commitResult, setCommitResult] = useState<{ created: number; failed: number; errors: string[] } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function handleFile(file: File) {
    setFileName(file.name)
    setParsing(true)

    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/app/import/parse', { method: 'POST', body: form })
    setParsing(false)

    if (!res.ok) {
      const err = await res.json()
      alert(err.error ?? 'Failed to parse file')
      return
    }

    const result: ParseResult = await res.json()
    setParseResult(result)
    setRecords(result.records)
    setStep('review')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function handleCommit() {
    if (!parseResult || records.length === 0) return
    setCommitting(true)

    const res = await fetch('/api/app/import/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType: parseResult.docType, records }),
    })

    setCommitting(false)
    const result = await res.json()
    setCommitResult(result)
    setStep('done')
  }

  function reset() {
    setStep('upload')
    setParseResult(null)
    setRecords([])
    setFileName('')
    setCommitResult(null)
  }

  // ── Upload step ────────────────────────────────────────────────────────────
  if (step === 'upload') {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Import records"
          description="Upload a spreadsheet or document to import records into Clerkflow."
          breadcrumbs={[{ label: 'Admin', href: '/app/tools' }, { label: 'Import' }]}
        />

        <div className="mt-6 space-y-4">
          <div
            role="button"
            tabIndex={0}
            className={[
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-16 text-center transition-colors cursor-pointer',
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30',
              parsing ? 'pointer-events-none opacity-60' : '',
            ].join(' ')}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {parsing ? (
              <>
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">Reading {fileName}…</p>
                <p className="mt-1 text-xs text-muted-foreground">Extracting and analyzing content</p>
              </>
            ) : (
              <>
                <Upload className="size-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  Drop a file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  CSV, Excel (.xlsx), PDF, or Word (.docx) — max 10 MB
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf,.docx,.doc"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          <Card className="p-4">
            <p className="text-xs font-semibold text-foreground">What can I import?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { label: 'Board roster', desc: 'Member names, boards, seats, term dates' },
                { label: 'Meeting list', desc: 'Meeting titles, dates, locations' },
                { label: 'FOIA log', desc: 'Requester info, descriptions, statuses' },
                { label: 'License log', desc: 'Permit types, applicants, statuses' },
              ].map(({ label, desc }) => (
                <div key={label} className="rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ── Review step ────────────────────────────────────────────────────────────
  if (step === 'review' && parseResult) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Review import"
          description={`From: ${fileName}`}
          breadcrumbs={[{ label: 'Import', href: '/app/import' }, { label: 'Review' }]}
          actions={
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="size-4" /> Start over
            </Button>
          }
        />

        <div className="mt-6 space-y-4">
          {/* Detection summary */}
          <Card className="flex flex-wrap items-center gap-3 p-4">
            <FileText className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Detected: <span className="text-primary">{DOC_TYPE_LABELS[parseResult.docType]}</span>
                {' '}— {records.length} record{records.length !== 1 ? 's' : ''} found
              </p>
              <p className="text-xs text-muted-foreground">
                Will import into:{' '}
                <span className="font-medium">{DOC_TYPE_DESTINATIONS[parseResult.docType]}</span>
              </p>
            </div>
            <ConfidenceBadge score={parseResult.confidence} />
          </Card>

          {/* Warnings */}
          {parseResult.warnings.length > 0 && (
            <div className="space-y-1">
              {parseResult.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning-foreground">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* AI fallback banner */}
          {parseResult.needsAI && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Low confidence extraction</p>
                <p className="text-xs text-muted-foreground">
                  AI extraction was used to identify records from this document. Review and edit
                  below before importing.
                </p>
              </div>
            </div>
          )}

          {/* Editable records */}
          {records.length > 0 ? (
            <>
              <div className="space-y-2">
                {records.map((record, i) => (
                  <RecordRow
                    key={i}
                    record={record}
                    docType={parseResult.docType}
                    index={i}
                    onChange={(idx, r) => setRecords((prev) => prev.map((x, j) => j === idx ? r : x))}
                    onRemove={(idx) => setRecords((prev) => prev.filter((_, j) => j !== idx))}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  {records.length} record{records.length !== 1 ? 's' : ''} will be imported.
                  Edit or remove any rows above before confirming.
                </p>
                <Button onClick={handleCommit} disabled={committing || records.length === 0}>
                  {committing
                    ? <><Loader2 className="size-4 animate-spin" /> Importing…</>
                    : <><ChevronRight className="size-4" /> Import {records.length} record{records.length !== 1 ? 's' : ''}</>
                  }
                </Button>
              </div>
            </>
          ) : (
            <Card className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No records could be extracted automatically.
              </p>
              <Button variant="outline" className="mt-4" onClick={reset}>
                Try a different file
              </Button>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // ── Done step ──────────────────────────────────────────────────────────────
  if (step === 'done' && commitResult) {
    const dest = parseResult ? DOC_TYPE_DESTINATIONS[parseResult.docType] : '/app'

    return (
      <div className="mx-auto max-w-xl">
        <PageHeader
          title="Import complete"
          breadcrumbs={[{ label: 'Import', href: '/app/import' }, { label: 'Done' }]}
        />

        <Card className="mt-6 p-6 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            {commitResult.created} record{commitResult.created !== 1 ? 's' : ''} imported
          </h2>
          {commitResult.failed > 0 && (
            <p className="mt-1 text-sm text-warning-foreground">
              {commitResult.failed} row{commitResult.failed !== 1 ? 's' : ''} skipped
            </p>
          )}
          {commitResult.errors.length > 0 && (
            <div className="mt-3 rounded-lg bg-muted/40 px-4 py-3 text-left">
              {commitResult.errors.map((e, i) => (
                <p key={i} className="text-xs text-muted-foreground">{e}</p>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
            <Button onClick={() => router.push(dest)}>
              View imported records
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return null
}
