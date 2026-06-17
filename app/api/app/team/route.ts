import { NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { listPendingInvitations, listTeamMembers } from '@/lib/server/team'
import { getDb } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { towns } from '@/lib/db/schema'

export async function GET() {
  try {
    const context = await requireStaffUser()
    const townId = context.townId!

    const [members, pending, town] = await Promise.all([
      listTeamMembers(townId),
      listPendingInvitations(townId),
      getDb().query.towns.findFirst({ where: eq(towns.id, townId) }),
    ])

    const isAdmin = context.user.role !== 'member'

    return NextResponse.json({
      members,
      pending,
      maxMembers: town?.maxMembers ?? 1,
      currentUserId: context.user.id,
      isAdmin,
    })
  } catch (e) {
    console.error('[/api/app/team]', e)
    if (e instanceof Error) {
      if (e.message === 'Unauthorized' || e.message === 'User is not linked to a town') {
        return NextResponse.json(
          { error: 'Sign in with a team account or accept your invite link.' },
          { status: 401 },
        )
      }
    }
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 })
  }
}
