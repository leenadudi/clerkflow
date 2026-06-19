import { clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import { gmailConnections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'
const GMAIL_PROFILE_URL = 'https://www.googleapis.com/gmail/v1/users/me/profile'

export async function maybeAutoConnect(opts: {
  townId: string
  userId: string
  clerkUserId: string
}): Promise<void> {
  const { townId, userId, clerkUserId } = opts
  const db = getDb()

  // Fast path: already connected
  const existing = await db.query.gmailConnections.findFirst({
    where: and(
      eq(gmailConnections.townId, townId),
      eq(gmailConnections.clerkUserId, clerkUserId),
      eq(gmailConnections.isActive, true),
    ),
  })
  if (existing) return

  // Check if they have a Google OAuth token with Gmail scopes
  let token: string | undefined
  try {
    const client = await clerkClient()
    const res = await client.users.getUserOauthAccessToken(clerkUserId, 'oauth_google')
    const t = res.data?.[0]
    if (!t?.token) return
    if (!t.scopes?.includes(GMAIL_SCOPE)) return
    token = t.token
  } catch {
    return
  }

  // Get Gmail address
  let gmailAddress = ''
  try {
    const profileRes = await fetch(GMAIL_PROFILE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (profileRes.ok) {
      const profile = await profileRes.json()
      gmailAddress = profile.emailAddress ?? ''
    }
  } catch {
    return
  }
  if (!gmailAddress) return

  // Deactivate any old connection for this town and create new one
  await db.update(gmailConnections).set({ isActive: false }).where(eq(gmailConnections.townId, townId))
  await db.insert(gmailConnections).values({ townId, userId, clerkUserId, gmailAddress })
}
