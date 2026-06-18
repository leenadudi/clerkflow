'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function FoiaForm({ townSlug }: { townSlug: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const body = {
      title: form.get('title'),
      requesterName: form.get('requesterName'),
      requesterEmail: form.get('requesterEmail') || undefined,
      summary: form.get('summary'),
    }

    const res = await fetch(`/api/public/${townSlug}/foia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (!res.ok) {
      setError('Something went wrong. Please try again or call the town office.')
      return
    }

    const data = await res.json()
    setConfirmation(data.publicId)
  }

  if (confirmation) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 px-6 py-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h2 className="mt-3 text-lg font-semibold text-foreground">Request submitted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your confirmation number is:
        </p>
        <p className="mt-1 text-xl font-bold tracking-wide text-foreground">{confirmation}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Save this number to track your request status. You'll receive a response within the
          statutory timeframe.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => window.location.assign(`/${townSlug}/track`)}
        >
          Track this request
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="requesterName">Your name</Label>
        <Input id="requesterName" name="requesterName" required placeholder="Full name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="requesterEmail">
          Email address <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="requesterEmail"
          name="requesterEmail"
          type="email"
          placeholder="We'll use this to send updates"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="title">Brief title for your request</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g. Council meeting minutes — May 2026"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="summary">Describe the records you're requesting</Label>
        <Textarea
          id="summary"
          name="summary"
          required
          rows={5}
          placeholder="Be as specific as possible: date ranges, document types, departments, etc."
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit request'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Requests are logged and responded to within the statutory timeframe. No account required.
      </p>
    </form>
  )
}
