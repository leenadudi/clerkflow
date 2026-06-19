'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CheckNowButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function check() {
    setLoading(true)
    try {
      await fetch('/api/email/poll-now', { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={check} disabled={loading}>
      <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Checking…' : 'Check now'}
    </Button>
  )
}
