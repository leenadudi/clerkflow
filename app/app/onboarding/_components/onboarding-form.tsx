'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

type Props = {
  defaultName: string
  defaultEmail: string
}

export function OnboardingForm({ defaultName, defaultEmail }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    townName: '',
    state: '',
    population: '',
    clerkName: defaultName,
    clerkRole: 'Town Clerk',
    clerkEmail: defaultEmail,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/app/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        townName: form.townName,
        state: form.state,
        population: form.population ? Number(form.population) : null,
        clerkName: form.clerkName,
        clerkRole: form.clerkRole,
        clerkEmail: form.clerkEmail,
      }),
    })

    const data = (await res.json().catch(() => null)) as { error?: string } | null
    setLoading(false)

    if (!res.ok) {
      setError(data?.error ?? 'Something went wrong. Please try again.')
      return
    }

    router.push('/app')
    router.refresh()
  }

  function canContinueStep1() {
    return form.townName.trim().length > 0 && form.state.length === 2
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={step === 1 ? 'text-primary' : ''}>1. Your town</span>
        <span aria-hidden>→</span>
        <span className={step === 2 ? 'text-primary' : ''}>2. Your profile</span>
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tell us about your town</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Town name
              </label>
              <Input
                required
                placeholder="Township of Riverside"
                value={form.townName}
                onChange={(e) => setForm({ ...form, townName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  State
                </label>
                <select
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select…</option>
                  {US_STATES.map((abbr) => (
                    <option key={abbr} value={abbr}>
                      {abbr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Population (optional)
                </label>
                <Input
                  type="number"
                  min={1}
                  placeholder="1,200"
                  value={form.population}
                  onChange={(e) => setForm({ ...form, population: e.target.value })}
                />
              </div>
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={!canContinueStep1()}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Set up your profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Your name
              </label>
              <Input
                required
                value={form.clerkName}
                onChange={(e) => setForm({ ...form, clerkName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Your role
              </label>
              <Input
                required
                value={form.clerkRole}
                onChange={(e) => setForm({ ...form, clerkRole: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Work email
              </label>
              <Input
                required
                type="email"
                value={form.clerkEmail}
                onChange={(e) => setForm({ ...form, clerkEmail: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll be set up as the town admin. You can invite staff from Settings after
              this.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating workspace…' : 'Create workspace'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  )
}
