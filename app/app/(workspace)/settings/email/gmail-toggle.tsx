'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { CheckCircle2, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
]

export function GmailToggle({
  enabled: initialEnabled,
  gmailAddress,
  emailsProcessed,
  requestsCreated,
  lastCheckedAt,
}: {
  enabled: boolean
  gmailAddress: string | null
  emailsProcessed: number
  requestsCreated: number
  lastCheckedAt: string | null
}) {
  const { user } = useUser()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function connectGmail() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const redirectUrl = window.location.href
      const googleAccount = user.externalAccounts.find((a) => a.provider.includes('google'))

      let redirectTarget: string | undefined

      if (googleAccount) {
        // Already has Google — re-authorize with Gmail scopes
        const result = await googleAccount.reauthorize({
          additionalScopes: GMAIL_SCOPES,
          redirectUrl,
        })
        redirectTarget = result.verification?.externalVerificationRedirectURL?.toString()
      } else {
        // No Google account yet — connect it with Gmail scopes
        const result = await user.createExternalAccount({
          strategy: 'oauth_google',
          redirectUrl,
          additionalScopes: GMAIL_SCOPES,
        })
        redirectTarget = result.verification?.externalVerificationRedirectURL?.toString()
      }

      if (redirectTarget) {
        window.location.href = redirectTarget
      } else {
        setError('Could not start Google authorization. Please try again.')
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function disconnect() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/email/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: false }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong.')
        return
      }
      setEnabled(false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (enabled && gmailAddress) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-success" />
          <span className="text-sm font-medium text-foreground">Connected</span>
          <span className="text-sm text-muted-foreground">— {gmailAddress}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-1 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Emails processed</span>
          <span className="font-medium">{emailsProcessed.toLocaleString()}</span>
          <span className="text-muted-foreground">Records created</span>
          <span className="font-medium">{requestsCreated.toLocaleString()}</span>
          {lastCheckedAt && (
            <>
              <span className="text-muted-foreground">Last checked</span>
              <span className="font-medium">{new Date(lastCheckedAt).toLocaleString()}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-success">
          <CheckCircle2 className="size-3.5" />
          Checking for new emails every 5 minutes
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          variant="ghost"
          size="sm"
          onClick={disconnect}
          disabled={loading}
          className="w-fit text-danger hover:text-danger"
        >
          <Unplug className="size-4" />
          {loading ? 'Disconnecting…' : 'Disconnect Gmail'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Gmail is not connected. Click below to authorize Clerkflow to read and send emails from
        your Gmail account.
      </p>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button size="sm" onClick={connectGmail} disabled={loading || !user} className="w-fit">
        {loading ? 'Connecting…' : 'Connect Gmail'}
      </Button>
    </div>
  )
}
