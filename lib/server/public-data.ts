import { eq, desc, and, asc } from 'drizzle-orm'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { towns, meetings, agendaItems } from '@/lib/db/schema'
import { meetingToView } from '@/lib/db/mappers'
import { TOWN, MEETINGS } from '@/lib/data'

export type PublicTown = {
  id: string
  slug: string
  name: string
  shortName: string
  clerkName?: string
  clerkEmail?: string
  state: string
}

const MOCK_TOWN: PublicTown = {
  id: 'mock',
  slug: TOWN.slug,
  name: TOWN.name,
  shortName: TOWN.shortName,
  state: TOWN.state,
}

export async function getTownBySlug(slug: string): Promise<PublicTown | null> {
  if (!isDatabaseConfigured()) {
    return slug === TOWN.slug ? MOCK_TOWN : null
  }
  const db = getDb()
  const row = await db.query.towns.findFirst({ where: eq(towns.slug, slug) })
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.shortName,
    clerkName: row.clerkName ?? undefined,
    clerkEmail: row.clerkEmail ?? undefined,
    state: row.state,
  }
}

export async function getPublishedMeetingsList(townId: string) {
  if (!isDatabaseConfigured() || townId === 'mock') {
    return MEETINGS.filter((m) => m.status === 'published')
  }
  const db = getDb()
  const rows = await db.query.meetings.findMany({
    where: and(eq(meetings.townId, townId), eq(meetings.status, 'published')),
    orderBy: [desc(meetings.startsAt)],
  })
  return rows.map(meetingToView)
}

export async function getPublishedMeeting(townId: string, externalId: string) {
  if (!isDatabaseConfigured() || townId === 'mock') {
    return MEETINGS.find((m) => m.id === externalId && m.status === 'published') ?? null
  }
  const db = getDb()
  const row = await db.query.meetings.findFirst({
    where: and(
      eq(meetings.townId, townId),
      eq(meetings.externalId, externalId),
      eq(meetings.status, 'published'),
    ),
    with: {
      agendaItems: { orderBy: [asc(agendaItems.sortOrder)] },
    },
  })
  if (!row) return null
  return {
    ...meetingToView(row),
    agendaItems: row.agendaItems,
  }
}
