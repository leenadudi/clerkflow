import { NextRequest, NextResponse } from 'next/server'
import { and, ilike, or, eq } from 'drizzle-orm'
import { getAppContext } from '@/lib/auth/app'
import { withTownContext } from '@/lib/db'
import { foiaRequests, meetings, licenses } from '@/lib/db/schema'

export type SearchResult = {
  type: string
  id: string
  title: string
  subtitle: string
  href: string
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const context = await getAppContext()
  const { townId } = context

  if (!townId) {
    return NextResponse.json({ results: [] })
  }

  const pattern = `%${q}%`

  const results = await withTownContext(townId, async (db) => {
    const [foiaRows, meetingRows, licenseRows] = await Promise.all([
      db
        .select({
          publicId: foiaRequests.publicId,
          requesterName: foiaRequests.requesterName,
        })
        .from(foiaRequests)
        .where(
          and(
            eq(foiaRequests.townId, townId),
            or(
              ilike(foiaRequests.requesterName, pattern),
              ilike(foiaRequests.publicId, pattern),
              ilike(foiaRequests.summary, pattern),
            ),
          ),
        )
        .limit(5),

      db
        .select({
          id: meetings.externalId,
          title: meetings.title,
          startsAt: meetings.startsAt,
        })
        .from(meetings)
        .where(
          and(
            eq(meetings.townId, townId),
            ilike(meetings.title, pattern),
          ),
        )
        .limit(5),

      db
        .select({
          publicId: licenses.publicId,
          applicantName: licenses.applicantName,
          type: licenses.type,
        })
        .from(licenses)
        .where(
          and(
            eq(licenses.townId, townId),
            or(
              ilike(licenses.applicantName, pattern),
              ilike(licenses.type, pattern),
            ),
          ),
        )
        .limit(5),
    ])

    const foiaResults: SearchResult[] = foiaRows.map((row) => ({
      type: 'foia',
      id: row.publicId,
      title: row.requesterName,
      subtitle: row.publicId,
      href: `/app/records/${row.publicId}`,
    }))

    const meetingResults: SearchResult[] = meetingRows.map((row) => ({
      type: 'meeting',
      id: row.id,
      title: row.title,
      subtitle: row.startsAt
        ? new Date(row.startsAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '',
      href: `/app/meetings/${row.id}`,
    }))

    const licenseResults: SearchResult[] = licenseRows.map((row) => ({
      type: 'permit',
      id: row.publicId,
      title: row.applicantName,
      subtitle: row.type.replace(/_/g, ' '),
      href: `/app/services/${row.publicId}`,
    }))

    return [...foiaResults, ...meetingResults, ...licenseResults]
  })

  return NextResponse.json({ results })
}
