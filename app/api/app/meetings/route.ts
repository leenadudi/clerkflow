import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { createMeeting, listMeetings } from '@/lib/server/data'

export async function GET() {
  try {
    await requireStaffUser()
    const meetings = await listMeetings()
    return NextResponse.json({ meetings })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaffUser()
    const body = await request.json()

    if (!body.title || !body.body || !body.startsAt || !body.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const meeting = await createMeeting({
      title: body.title,
      body: body.body,
      startsAt: new Date(body.startsAt),
      location: body.location,
      status: body.status,
      meetingType: body.meetingType,
      internalNotes: body.internalNotes,
    })

    return NextResponse.json({ meeting }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }
}
