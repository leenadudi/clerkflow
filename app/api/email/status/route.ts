import { NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getDb } from '@/lib/db'
import { gmailConnections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  try {
    const context = await requireStaffUser()
    if (!context.townId || !context.clerkUserId) {
      return NextResponse.json({ connected: false })
    }

    const db = getDb()
    const connection = await db.query.gmailConnections.findFirst({
      where: and(
        eq(gmailConnections.townId, context.townId),
        eq(gmailConnections.clerkUserId, context.clerkUserId),
        eq(gmailConnections.isActive, true),
      ),
    })

    if (!connection) return NextResponse.json({ connected: false })

    return NextResponse.json({
      connected: true,
      gmailAddress: connection.gmailAddress,
      emailsProcessed: connection.emailsProcessed,
      requestsCreated: connection.requestsCreated,
      lastCheckedAt: connection.lastCheckedAt?.toISOString() ?? null,
    })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
