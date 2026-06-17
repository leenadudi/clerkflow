'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function InviteForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/app/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      return
    }

    setSent(true)
    setEmail('')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setSent(false) }}
          placeholder="clerk@townhall.gov"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="member">Staff Member</option>
          <option value="admin">Town Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send invite'}
      </Button>
      {error && <p className="text-xs text-destructive sm:col-span-3">{error}</p>}
      {sent && <p className="text-xs text-green-600 sm:col-span-3">Invitation sent!</p>}
    </form>
  )
}
