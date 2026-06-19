import { NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getDb } from '@/lib/db'
import { processedEmails } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const context = await requireStaffUser()
    if (!context.townId) return NextResponse.json({ emails: [] })
    const townId = context.townId
    const db = getDb()

    const emails = await db.query.processedEmails.findMany({
      where: eq(processedEmails.townId, townId),
      orderBy: [desc(processedEmails.receivedAt)],
      limit: 100,
    })

    return NextResponse.json({ emails })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
