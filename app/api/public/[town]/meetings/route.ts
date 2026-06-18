import { NextRequest, NextResponse } from 'next/server'
import { eq, desc, and } from 'drizzle-orm'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { meetings, towns } from '@/lib/db/schema'
import { meetingToView } from '@/lib/db/mappers'
import { MEETINGS } from '@/lib/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ town: string }> },
) {
  const { town: townSlug } = await params

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      meetings: MEETINGS.filter((m) => m.status === 'published'),
    })
  }

  const db = getDb()
  const town = await db.query.towns.findFirst({ where: eq(towns.slug, townSlug) })
  if (!town) return NextResponse.json({ error: 'Town not found' }, { status: 404 })

  const rows = await db.query.meetings.findMany({
    where: and(eq(meetings.townId, town.id), eq(meetings.status, 'published')),
    orderBy: [desc(meetings.startsAt)],
  })

  return NextResponse.json({ meetings: rows.map(meetingToView) })
}
