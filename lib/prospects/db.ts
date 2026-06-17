import { asc, desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { prospects, type ProspectRow } from '@/lib/db/schema'
import type { CreateProspectInput, Prospect, ProspectStatus } from './types'

function rowToProspect(row: ProspectRow): Prospect {
  return {
    id: row.id,
    townName: row.townName,
    state: row.state,
    population: row.population,
    clerkName: row.clerkName,
    email: row.email,
    contactInfo: row.contactInfo,
    notes: row.notes,
    status: row.status as ProspectStatus,
    lastContactedAt: row.lastContactedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listProspectsFromDb(): Promise<Prospect[]> {
  const db = getDb()
  const rows = await db.query.prospects.findMany({
    orderBy: [desc(prospects.createdAt)],
  })
  return rows.map(rowToProspect)
}

export async function getProspectFromDb(id: string): Promise<Prospect | null> {
  const db = getDb()
  const row = await db.query.prospects.findFirst({
    where: eq(prospects.id, id),
  })
  return row ? rowToProspect(row) : null
}

export async function createProspectInDb(input: CreateProspectInput): Promise<Prospect> {
  const db = getDb()
  const now = new Date()
  const [row] = await db
    .insert(prospects)
    .values({
      id: crypto.randomUUID(),
      townName: input.townName.trim(),
      state: input.state.trim().toUpperCase(),
      population: input.population ?? null,
      clerkName: input.clerkName.trim(),
      email: input.email?.trim().toLowerCase() || null,
      contactInfo: input.contactInfo?.trim() || null,
      notes: input.notes?.trim() || '',
      status: 'not_contacted',
      lastContactedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return rowToProspect(row)
}

export async function updateProspectStatusInDb(
  id: string,
  status: ProspectStatus,
  lastContactedAt?: string | null,
): Promise<Prospect | null> {
  const db = getDb()
  const existing = await db.query.prospects.findFirst({
    where: eq(prospects.id, id),
  })
  if (!existing) return null

  const [row] = await db
    .update(prospects)
    .set({
      status,
      lastContactedAt:
        lastContactedAt !== undefined
          ? lastContactedAt
            ? new Date(lastContactedAt)
            : null
          : existing.lastContactedAt,
      updatedAt: new Date(),
    })
    .where(eq(prospects.id, id))
    .returning()

  return rowToProspect(row)
}

export async function listNotContactedFromDb(): Promise<Prospect[]> {
  const db = getDb()
  const rows = await db.query.prospects.findMany({
    where: eq(prospects.status, 'not_contacted'),
    orderBy: [asc(prospects.createdAt)],
  })
  return rows.map(rowToProspect)
}

export async function importProspectsToDb(items: Prospect[]): Promise<number> {
  if (items.length === 0) return 0

  const db = getDb()
  const existing = await db.query.prospects.findMany({ columns: { id: true } })
  const existingIds = new Set(existing.map((row) => row.id))
  const toInsert = items.filter((item) => !existingIds.has(item.id))
  if (toInsert.length === 0) return 0

  await db.insert(prospects).values(
    toInsert.map((item) => ({
      id: item.id,
      townName: item.townName,
      state: item.state,
      population: item.population,
      clerkName: item.clerkName,
      email: item.email,
      contactInfo: item.contactInfo,
      notes: item.notes,
      status: item.status,
      lastContactedAt: item.lastContactedAt ? new Date(item.lastContactedAt) : null,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
  )

  return toInsert.length
}
