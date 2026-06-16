'use client'

import { useState } from 'react'
import { Search, CheckCircle2, Circle, FileSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResidentHeader } from '@/components/resident/header'
import { StatusPill } from '@/components/status-pill'

const TIMELINE = [
  { label: 'Request received', meta: 'Jun 9, 2026', state: 'done' },
  { label: 'Acknowledgment sent', meta: 'Jun 9, 2026', state: 'done' },
  { label: 'Records being gathered', meta: 'Jun 11, 2026', state: 'done' },
  { label: 'Under review & redaction', meta: 'In progress', state: 'current' },
  { label: 'Records released', meta: 'Pending', state: 'pending' },
] as const

export default function TrackRequestPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ResidentHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Track my request
        </h1>
        <p className="mt-1 text-muted-foreground">
          Enter the confirmation number from your request email to see its
          current status.
        </p>

        <Card className="mt-6">
          <CardContent className="p-5">
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  defaultValue="FOIA-1042"
                  placeholder="e.g. FOIA-1042"
                  className="pl-9"
                  aria-label="Confirmation number"
                />
              </div>
              <Button type="submit">Track request</Button>
            </form>
          </CardContent>
        </Card>

        {submitted ? (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  FOIA-1042
                </p>
                <CardTitle className="mt-0.5 text-base">
                  Police incident reports — Maple St, June 2026
                </CardTitle>
              </div>
              <StatusPill status="in-progress" />
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-5">
                {TIMELINE.map((step) => (
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
              <p className="mt-6 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
                Questions about this request? Contact the Town Clerk&apos;s office
                at clerk@riverside-oh.gov.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileSearch className="size-6" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
              Enter your confirmation number above to see your request status.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
