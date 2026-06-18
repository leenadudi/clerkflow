import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { addAttendee } from '@/lib/server/data'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { name, role, boardName, isGuest } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const attendee = await addAttendee(id, { name, role, boardName, isGuest })
    return NextResponse.json({ attendee }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Meeting not found') {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to add attendee' }, { status: 500 })
  }
}
