'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function StatusActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(newStatus: string) {
    setLoading(newStatus)
    await fetch(`/api/app/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setLoading(null)
    router.refresh()
  }

  if (status === 'approved' || status === 'denied') {
    return (
      <Button
        variant="outline"
        onClick={() => updateStatus('pending')}
        disabled={loading !== null}
      >
        {loading === 'pending' ? 'Reverting…' : 'Revert to pending'}
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="border-destructive/40 text-destructive hover:bg-destructive/5"
        onClick={() => updateStatus('denied')}
        disabled={loading !== null}
      >
        {loading === 'denied' ? 'Denying…' : 'Deny'}
      </Button>
      <Button
        onClick={() => updateStatus('approved')}
        disabled={loading !== null}
      >
        {loading === 'approved' ? 'Approving…' : 'Approve'}
      </Button>
    </div>
  )
}
