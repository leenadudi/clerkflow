import { type NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getDb } from '@/lib/db'
import { gmailConnections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { clerkClient } from '@clerk/nextjs/server'

const GMAIL_PROFILE_URL = 'https://www.googleapis.com/gmail/v1/users/me/profile'

export async function POST(request: NextRequest) {
  try {
    const context = await requireStaffUser()
    if (!context.townId || !context.clerkUserId) {
      return NextResponse.json({ error: 'Not configured' }, { status: 400 })
    }
    const { townId, clerkUserId } = context

    const { enable } = (await request.json()) as { enable: boolean }
    const db = getDb()

    if (!enable) {
      await db
        .update(gmailConnections)
        .set({ isActive: false })
        .where(
          and(eq(gmailConnections.townId, townId), eq(gmailConnections.clerkUserId, clerkUserId)),
        )
      return NextResponse.json({ ok: true })
    }

    // Try to get a Google OAuth token — most reliable way to check if Google is connected
    const client = await clerkClient()
    const tokenRes = await client.users.getUserOauthAccessToken(clerkUserId, 'oauth_google')
    const token = tokenRes.data?.[0]?.token

    if (!token) {
      return NextResponse.json(
        { error: 'No Google account connected. Sign out and sign back in with Google to enable Gmail.' },
        { status: 400 },
      )
    }

    // Get Gmail address directly from Gmail API
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
      // Fall back to Clerk user email
    }

    if (!gmailAddress) {
      const user = await client.users.getUser(clerkUserId)
      gmailAddress = user.emailAddresses[0]?.emailAddress ?? ''
    }

    // Deactivate any existing connection for this town
    await db
      .update(gmailConnections)
      .set({ isActive: false })
      .where(eq(gmailConnections.townId, townId))

    // Create new connection
    await db.insert(gmailConnections).values({
      townId,
      userId: context.user.id,
      clerkUserId,
      gmailAddress,
    })

    return NextResponse.json({ ok: true, gmailAddress })
  } catch (err) {
    console.error('Gmail toggle error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
