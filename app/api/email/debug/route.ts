import { NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const context = await requireStaffUser()
    const client = await clerkClient()

    const userId = context.clerkUserId
    if (!userId) return NextResponse.json({ error: 'No clerkUserId in context' })

    const user = await client.users.getUser(userId)
    const externalAccounts = user.externalAccounts.map((a) => ({
      provider: a.provider,
      email: a.emailAddress,
    }))

    const tokenRes = await client.users.getUserOauthAccessToken(userId, 'oauth_google')
    const tokens = tokenRes.data?.map((t) => ({
      hasToken: !!t.token,
      scopes: t.scopes,
    }))

    return NextResponse.json({
      clerkUserId: userId,
      townId: context.townId,
      externalAccounts,
      googleTokens: tokens,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) })
  }
}
