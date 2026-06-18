'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PublishButton({ meetingId }: { meetingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePublish() {
    setLoading(true)
    await fetch(`/api/app/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish-agenda' }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <Button onClick={handlePublish} disabled={loading}>
      <Send className="size-4" />
      {loading ? 'Publishing…' : 'Publish to resident hub'}
    </Button>
  )
}
