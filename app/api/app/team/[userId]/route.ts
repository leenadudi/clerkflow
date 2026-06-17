import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/app'
import { removeTeamMember } from '@/lib/server/team'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const context = await requireAdmin()
    const { userId } = await params

    await removeTeamMember(context.townId!, userId, context.user.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'CANNOT_REMOVE_SELF') {
        return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 400 })
      }
      if (error.message === 'CANNOT_REMOVE_LAST_ADMIN') {
        return NextResponse.json({ error: 'Cannot remove the last admin.' }, { status: 400 })
      }
      if (error.message === 'MEMBER_NOT_FOUND') {
        return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
      }
    }
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
