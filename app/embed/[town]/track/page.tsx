'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Search, CheckCircle2, Circle, FileSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusPill } from '@/components/status-pill'
import type { StatusKey } from '@/components/status-pill'

type TrackResult = {
  publicId: string
  title: string
  status: StatusKey
  clerkEmail?: string
  timeline: Array<{
    label: string
    meta: string
    state: 'done' | 'current' | 'pending'
  }>
}

export default function EmbedTrackPage() {
  const params = useParams<{ town: string }>()
  const townSlug = params.town
  const [confirmation, setConfirmation] = useState('')
  const [result, setResult] = useState<TrackResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch(
        `/api/public/track?town=${encodeURIComponent(townSlug)}&code=${encodeURIComponent(confirmation)}`,
      )
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Request not found')
        return
      }
      setResult(data)
    } catch {
      setError('Unable to look up that confirmation number.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold text-foreground">Track my request</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Enter your confirmation number to see the current status.
      </p>

      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="e.g. FOIA-1042"
            className="pl-9"
            aria-label="Confirmation number"
          />
        </div>
        <Button type="submit" disabled={loading || !confirmation.trim()}>
          {loading ? 'Looking up…' : 'Track'}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {result ? (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{result.publicId}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{result.title}</p>
            </div>
            <StatusPill status={result.status} />
          </div>
          <ol className="mt-4 flex flex-col gap-3">
            {result.timeline.map((step) => (
              <li key={step.label} className="flex items-start gap-3">
                {step.state === 'done' ? (
                  <CheckCircle2 className="size-4 shrink-0 text-[#16a34a]" />
                ) : step.state === 'current' ? (
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                )}
                <div>
                  <p className={`text-xs font-medium ${step.state === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.meta}</p>
                </div>
              </li>
            ))}
          </ol>
          {result.clerkEmail && (
            <p className="mt-4 text-xs text-muted-foreground">
              Questions? Contact the clerk at{' '}
              <a href={`mailto:${result.clerkEmail}`} className="text-primary hover:underline">
                {result.clerkEmail}
              </a>
            </p>
          )}
        </div>
      ) : !error ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
          <FileSearch className="size-8 text-muted-foreground/50" />
          <p className="mt-2 text-xs text-muted-foreground">Enter your confirmation number above</p>
        </div>
      ) : null}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Powered by{' '}
        <a href="https://clerkflow.software" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Clerkflow
        </a>
      </p>
    </div>
  )
}
