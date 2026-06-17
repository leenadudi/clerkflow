import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/app'
import { createInvitation } from '@/lib/server/team'
import { sendInviteEmail } from '@/lib/email/invite'

export async function POST(request: NextRequest) {
  try {
    const context = await requireAdmin()
    const body = await request.json()

    const email = (body.email ?? '').trim().toLowerCase()
    const role = body.role ?? 'member'

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin or member' }, { status: 400 })
    }

    const invitation = await createInvitation(context.townId!, email, role, context.user.id)

    const host = request.headers.get('host') ?? 'localhost:3000'
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const inviteUrl = `${protocol}://${host}/invite/${invitation.token}`

    await sendInviteEmail({
      to: email,
      inviterName: context.user.name,
      townName: context.town.name,
      role,
      inviteUrl,
      expiresAt: invitation.expiresAt,
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'SEAT_LIMIT_REACHED') {
        return NextResponse.json(
          { error: 'Seat limit reached. Contact us to add more members.' },
          { status: 403 },
        )
      }
      if (error.message === 'EMAIL_ALREADY_MEMBER') {
        return NextResponse.json(
          { error: 'This email is already a member of your team.' },
          { status: 409 },
        )
      }
      if (error.message === 'INVITE_ALREADY_SENT') {
        return NextResponse.json(
          { error: 'An invitation has already been sent to this email.' },
          { status: 409 },
        )
      }
    }
    console.error('Failed to create invitation:', error)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}
