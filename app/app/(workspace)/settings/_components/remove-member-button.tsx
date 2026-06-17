'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export function RemoveMemberButton({
  userId,
  name,
  onSuccess,
}: {
  userId: string
  name: string
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirm(`Remove ${name} from the team?`)) return
    setLoading(true)

    const res = await fetch(`/api/app/team/${userId}`, { method: 'DELETE' })

    setLoading(false)
    if (res.ok) {
      onSuccess()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Failed to remove member.')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
      title={`Remove ${name}`}
    >
      <Trash2 className="size-4" />
    </button>
  )
}
