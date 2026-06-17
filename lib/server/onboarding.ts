import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { towns, users } from '@/lib/db/schema'

export type OnboardingInput = {
  townName: string
  state: string
  population?: number | null
  clerkName: string
  clerkRole?: string
  clerkEmail: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'TC'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

async function uniqueSlug(base: string) {
  const db = getDb()
  let slug = base
  let suffix = 2

  while (true) {
    const existing = await db.query.towns.findFirst({
      where: eq(towns.slug, slug),
      columns: { id: true },
    })
    if (!existing) return slug
    slug = `${base}-${suffix}`
    suffix += 1
  }
}

export async function completeOnboarding(
  clerkUserId: string,
  input: OnboardingInput,
): Promise<{ townId: string; userId: string; slug: string }> {
  const db = getDb()

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
    columns: { id: true },
  })
  if (existing) throw new Error('ALREADY_ONBOARDED')

  const townName = input.townName.trim()
  const state = input.state.trim().toUpperCase()
  const clerkName = input.clerkName.trim()
  const clerkEmail = input.clerkEmail.trim().toLowerCase()
  const clerkRole = input.clerkRole?.trim() || 'Town Clerk'

  if (!townName || state.length !== 2 || !clerkName || !clerkEmail) {
    throw new Error('INVALID_INPUT')
  }

  const slug = await uniqueSlug(slugify(`${townName}-${state}`))
  const shortName = `${townName}, ${state}`

  return db.transaction(async (tx) => {
    const [town] = await tx
      .insert(towns)
      .values({
        slug,
        name: townName,
        shortName,
        population: input.population ?? null,
        clerkName,
        clerkRole,
        clerkInitials: initialsFromName(clerkName),
        clerkEmail,
        maxMembers: 1,
      })
      .returning()

    const [user] = await tx
      .insert(users)
      .values({
        clerkUserId,
        email: clerkEmail,
        name: clerkName,
        role: 'admin',
        townId: town.id,
      })
      .returning()

    return { townId: town.id, userId: user.id, slug: town.slug }
  })
}
