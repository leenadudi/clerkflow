import { NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getMeeting, getMeetingAgenda } from '@/lib/server/data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaffUser()
    const { id } = await params
    const [meeting, agenda] = await Promise.all([
      getMeeting(id),
      getMeetingAgenda(id),
    ])

    if (!meeting) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ meeting, agenda })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
