import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { updateMeetingActionItem, removeMeetingActionItem } from '@/lib/server/data'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { itemId } = await params
  try {
    const body = await request.json()
    const item = await updateMeetingActionItem(itemId, {
      title: body.title,
      assignedTo: body.assignedTo,
      dueDate: body.dueDate,
      done: body.done,
    })
    return NextResponse.json({ item })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Action item not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update action item' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { itemId } = await params
  try {
    await removeMeetingActionItem(itemId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Action item not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to remove action item' }, { status: 500 })
  }
}
