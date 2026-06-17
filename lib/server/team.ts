import { and, asc, count, desc, eq, gt, isNull, or } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { invitations, towns, users } from '@/lib/db/schema'

export async function listTeamMembers(townId: string) {
  const db = getDb()
  return db.query.users.findMany({
    where: eq(users.townId, townId),
    orderBy: [asc(users.createdAt)],
    columns: { id: true, name: true, email: true, role: true, createdAt: true },
  })
}

export async function listPendingInvitations(townId: string) {
  const db = getDb()
  return db.query.invitations.findMany({
    where: and(
      eq(invitations.townId, townId),
      isNull(invitations.acceptedAt),
      gt(invitations.expiresAt, new Date()),
    ),
    orderBy: [desc(invitations.createdAt)],
    columns: { id: true, email: true, role: true, createdAt: true, expiresAt: true },
  })
}

export async function createInvitation(
  townId: string,
  email: string,
  role: string,
  createdById: string,
) {
  const db = getDb()

  const town = await db.query.towns.findFirst({ where: eq(towns.id, townId) })
  if (!town) throw new Error('Town not found')

  const [{ memberCount }] = await db
    .select({ memberCount: count() })
    .from(users)
    .where(eq(users.townId, townId))

  if (memberCount >= town.maxMembers) throw new Error('SEAT_LIMIT_REACHED')

  const existing = await db.query.users.findFirst({
    where: and(eq(users.townId, townId), eq(users.email, email)),
  })
  if (existing) throw new Error('EMAIL_ALREADY_MEMBER')

  const existingInvite = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.townId, townId),
      eq(invitations.email, email),
      isNull(invitations.acceptedAt),
      gt(invitations.expiresAt, new Date()),
    ),
  })
  if (existingInvite) throw new Error('INVITE_ALREADY_SENT')

  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const [invitation] = await db
    .insert(invitations)
    .values({ townId, email, role, token, expiresAt, createdById })
    .returning()

  return invitation
}

export async function getInvitationByToken(token: string) {
  const db = getDb()
  return db.query.invitations.findFirst({
    where: eq(invitations.token, token),
    with: { town: true, createdBy: { columns: { name: true } } },
  })
}

export async function acceptInvitation(
  token: string,
  clerkUserId: string,
  name: string,
  email: string,
) {
  const db = getDb()

  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  })

  if (!invitation) throw new Error('INVALID_TOKEN')
  if (invitation.acceptedAt) throw new Error('ALREADY_ACCEPTED')
  if (invitation.expiresAt < new Date()) throw new Error('EXPIRED')

  const alreadyMember = await db.query.users.findFirst({
    where: and(eq(users.townId, invitation.townId), eq(users.clerkUserId, clerkUserId)),
  })
  if (alreadyMember) throw new Error('ALREADY_MEMBER')

  const [user] = await db
    .insert(users)
    .values({
      clerkUserId,
      email: invitation.email,
      name,
      role: invitation.role,
      townId: invitation.townId,
    })
    .returning()

  await db
    .update(invitations)
    .set({ acceptedAt: new Date() })
    .where(eq(invitations.token, token))

  return user
}

export async function removeTeamMember(
  townId: string,
  userId: string,
  requestingUserId: string,
) {
  if (userId === requestingUserId) throw new Error('CANNOT_REMOVE_SELF')

  const db = getDb()

  const member = await db.query.users.findFirst({
    where: and(eq(users.id, userId), eq(users.townId, townId)),
  })
  if (!member) throw new Error('MEMBER_NOT_FOUND')

  // Prevent removing the last admin
  const isAdmin = member.role !== 'member'
  if (isAdmin) {
    const [{ adminCount }] = await db
      .select({ adminCount: count() })
      .from(users)
      .where(
        and(
          eq(users.townId, townId),
          or(
            eq(users.role, 'admin'),
            eq(users.role, 'town_clerk'),
            eq(users.role, 'staff'),
          ),
        ),
      )
    if (adminCount <= 1) throw new Error('CANNOT_REMOVE_LAST_ADMIN')
  }

  await db.delete(users).where(and(eq(users.id, userId), eq(users.townId, townId)))
}
