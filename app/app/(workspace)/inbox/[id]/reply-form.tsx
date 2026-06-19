'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ReplyForm({
  emailId,
  defaultSubject,
}: {
  emailId: string
  defaultSubject: string
}) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!body.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId, replyBody: body }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to send')
      }
      router.push('/app/inbox')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Reply to: {defaultSubject ? `Re: ${defaultSubject}` : '(no subject)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <textarea
          className="min-h-[160px] w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Type your reply…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end">
          <Button disabled={!body.trim() || sending} onClick={handleSend}>
            <Send className="size-4" />
            {sending ? 'Sending…' : 'Send reply'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
