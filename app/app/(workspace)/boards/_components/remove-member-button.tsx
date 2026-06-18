'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RemoveMemberButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRemove() {
    if (!confirm(`Remove ${name} from this board?`)) return
    setLoading(true)
    await fetch(`/api/app/boards/${id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:text-destructive"
      onClick={handleRemove}
      disabled={loading}
      aria-label={`Remove ${name}`}
    >
      <Trash2 className="size-3.5" />
    </Button>
  )
}
