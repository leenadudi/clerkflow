'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function InternalLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/internal/prospects'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/internal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Login failed')
        return
      }

      router.push(next)
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Clerkflow internal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Password required. This area is for founder prospecting only.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    placeholder="Enter your internal password"
                  />
                </div>
              </div>

              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Set <code className="rounded bg-muted px-1">INTERNAL_PASSWORD</code> in your
              environment. Session lasts 7 days.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
