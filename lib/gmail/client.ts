import { clerkClient } from '@clerk/nextjs/server'

const GMAIL_BASE = 'https://www.googleapis.com/gmail/v1/users/me'

export interface GmailMessage {
  id: string
  threadId: string
  fromEmail: string
  fromName: string
  subject: string
  bodyText: string
  receivedAt: Date
}

async function getAccessToken(clerkUserId: string): Promise<string> {
  const client = await clerkClient()
  const response = await client.users.getUserOauthAccessToken(clerkUserId, 'oauth_google')
  const token = response.data?.[0]?.token
  if (!token) throw new Error('No Google OAuth token — user may need to reconnect Google account')
  return token
}

export async function listNewMessageIds(
  clerkUserId: string,
  since?: Date | null,
): Promise<string[]> {
  const token = await getAccessToken(clerkUserId)
  const params = new URLSearchParams({ maxResults: '50' })
  if (since) params.set('q', `after:${Math.floor(since.getTime() / 1000)}`)

  const res = await fetch(`${GMAIL_BASE}/messages?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`List messages failed: ${res.status}`)
  const data = await res.json()
  return ((data.messages ?? []) as { id: string }[]).map((m) => m.id)
}

export async function getMessage(clerkUserId: string, messageId: string): Promise<GmailMessage> {
  const token = await getAccessToken(clerkUserId)
  const res = await fetch(`${GMAIL_BASE}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Get message failed: ${res.status}`)
  const msg = await res.json()

  const hdrs: Record<string, string> = {}
  for (const h of msg.payload?.headers ?? []) hdrs[(h.name as string).toLowerCase()] = h.value

  const fromHeader = hdrs['from'] ?? ''
  const fromMatch = fromHeader.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+)>?$/)
  const fromName = (fromMatch?.[1] ?? '').trim()
  const fromEmail = (fromMatch?.[2] ?? fromHeader).trim()

  return {
    id: msg.id as string,
    threadId: msg.threadId as string,
    fromEmail,
    fromName,
    subject: hdrs['subject'] ?? '(no subject)',
    bodyText: extractText(msg.payload),
    receivedAt: new Date(parseInt(msg.internalDate ?? '0', 10)),
  }
}

function extractText(payload: Record<string, unknown> | null | undefined): string {
  if (!payload) return ''
  const body = payload.body as { data?: string } | undefined
  if (payload.mimeType === 'text/plain' && body?.data) {
    return Buffer.from(body.data, 'base64url').toString('utf8')
  }
  const parts = payload.parts as Record<string, unknown>[] | undefined
  if (parts) {
    for (const part of parts) {
      const text = extractText(part)
      if (text) return text
    }
  }
  return ''
}

export async function sendReply(
  clerkUserId: string,
  opts: { to: string; subject: string; body: string; threadId?: string },
): Promise<void> {
  const token = await getAccessToken(clerkUserId)

  const raw = [
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    opts.body,
  ].join('\r\n')

  const payload: Record<string, string> = { raw: Buffer.from(raw).toString('base64url') }
  if (opts.threadId) payload.threadId = opts.threadId

  const res = await fetch(`${GMAIL_BASE}/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Send failed: ${res.status}`)
}
