import { auth, currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { townToView } from '@/lib/db/mappers'
import { towns, users, type Town, type User } from '@/lib/db/schema'
import { TOWN } from '@/lib/data'

export function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  )
}

export type AppContext = {
  source: 'database' | 'mock'
  town: ReturnType<typeof townToView>
  townId: string | null
  user: Pick<User, 'id' | 'name' | 'email' | 'role'> | null
  clerkUserId: string | null
}

async function getMockContext(): Promise<AppContext> {
  return {
    source: 'mock',
    town: TOWN,
    townId: null,
    user: null,
    clerkUserId: null,
  }
}

async function resolveDatabaseUser(clerkUserId: string | null, email?: string | null) {
  if (!isDatabaseConfigured()) return null

  const db = getDb()

  if (clerkUserId) {
    const byClerk = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    })
    if (byClerk) return byClerk
  }

  if (email) {
    const byEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (byEmail) {
      if (clerkUserId && !byEmail.clerkUserId) {
        const [updated] = await db
          .update(users)
          .set({ clerkUserId, updatedAt: new Date() })
          .where(eq(users.id, byEmail.id))
          .returning()
        return updated
      }
      return byEmail
    }
  }

  return null
}

async function getDemoTown(): Promise<Town | null> {
  if (!isDatabaseConfigured()) return null
  const db = getDb()
  return (
    (await db.query.towns.findFirst({
      where: eq(towns.slug, 'riverside-oh'),
    })) ?? null
  )
}

export async function getAppContext(): Promise<AppContext> {
  if (!isDatabaseConfigured()) {
    return getMockContext()
  }

  const { userId } = await auth()
  const clerkUser = userId ? await currentUser() : null
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress

  const dbUser = await resolveDatabaseUser(userId, email)
  const town = dbUser
    ? await getDb().query.towns.findFirst({
        where: eq(towns.id, dbUser.townId),
      })
    : await getDemoTown()

  if (!town) {
    return getMockContext()
  }

  return {
    source: 'database',
    town: townToView(town),
    townId: town.id,
    user: dbUser
      ? {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        }
      : null,
    clerkUserId: userId,
  }
}

export async function requireAppContext(): Promise<AppContext> {
  const context = await getAppContext()
  if (context.source === 'mock') return context
  if (!context.townId) {
    throw new Error('No town context available')
  }
  return context
}

export async function requireStaffUser(): Promise<AppContext & { user: NonNullable<AppContext['user']> }> {
  if (!isClerkConfigured()) {
    const context = await requireAppContext()
    if (context.user) {
      return context as AppContext & { user: NonNullable<AppContext['user']> }
    }
    return {
      ...context,
      user: {
        id: 'demo-user',
        name: context.town.clerk.name,
        email: 'demo@clerkflow.local',
        role: 'town_clerk',
      },
    }
  }

  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const context = await requireAppContext()
  if (!context.user) {
    throw new Error('User is not linked to a town')
  }

  return context as AppContext & { user: NonNullable<AppContext['user']> }
}
