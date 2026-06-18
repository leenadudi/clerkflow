import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import {
  approveMinutes,
  getMeeting,
  getMeetingAgenda,
  publishAgenda,
  publishMeeting,
  updateMeeting,
} from '@/lib/server/data'

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

export async function PATCH(
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
    const { action, ...fields } = body

    if (action === 'publish') {
      await publishMeeting(id)
      return NextResponse.json({ ok: true })
    }

    if (action === 'publish-agenda') {
      await publishAgenda(id)
      return NextResponse.json({ ok: true })
    }

    if (action === 'approve-minutes') {
      await approveMinutes(id)
      return NextResponse.json({ ok: true })
    }

    // No action — treat body fields as a direct meeting update
    const allowed = [
      'presidingOfficer',
      'calledToOrderAt',
      'adjournedAt',
      'internalNotes',
      'minutesDraft',
      'minutesStatus',
    ]
    const updateFields = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k)),
    )

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await updateMeeting(id, updateFields)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
  }
}
