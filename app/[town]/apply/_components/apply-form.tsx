'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LICENSE_TYPES } from '@/lib/data'

export function ApplyForm({ townSlug }: { townSlug: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [type, setType] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const body = {
      type,
      applicantName: form.get('applicantName'),
      applicantEmail: form.get('applicantEmail') || undefined,
      applicantPhone: form.get('applicantPhone') || undefined,
      description: form.get('description') || undefined,
    }

    const res = await fetch(`/api/public/${townSlug}/apply`, {
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
        <h2 className="mt-3 text-lg font-semibold text-foreground">Application submitted</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your confirmation number is:</p>
        <p className="mt-1 text-xl font-bold tracking-wide text-foreground">{confirmation}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Save this number to track your application. The town clerk's office will be in touch.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => window.location.assign(`/${townSlug}/track`)}
        >
          Track this application
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label>What are you applying for?</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="Select type…" />
          </SelectTrigger>
          <SelectContent>
            {LICENSE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="applicantName">Your name or business name</Label>
        <Input id="applicantName" name="applicantName" required placeholder="Full name" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="applicantEmail">
            Email <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input id="applicantEmail" name="applicantEmail" type="email" placeholder="for updates" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="applicantPhone">
            Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input id="applicantPhone" name="applicantPhone" type="tel" placeholder="(000) 000-0000" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Additional details <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Address, dates, or other details relevant to your application"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading || !type}>
        {loading ? 'Submitting…' : 'Submit application'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        The town clerk's office will review your application and contact you. No account required.
      </p>
    </form>
  )
}
