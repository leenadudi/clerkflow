import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { removeAttendee, updateAttendee } from '@/lib/server/data'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attendeeId: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { attendeeId } = await params

  try {
    const body = await request.json()
    const { status, arrivedAt, leftAt, name, role } = body
    const attendee = await updateAttendee(attendeeId, { status, arrivedAt, leftAt, name, role })
    return NextResponse.json({ attendee })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Attendee not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update attendee' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; attendeeId: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { attendeeId } = await params

  try {
    await removeAttendee(attendeeId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Attendee not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to remove attendee' }, { status: 500 })
  }
}
