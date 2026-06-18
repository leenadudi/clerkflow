import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { updateMotion, removeMotion } from '@/lib/server/data'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; motionId: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { motionId } = await params
  try {
    const body = await request.json()
    const motion = await updateMotion(motionId, {
      agendaItemId: body.agendaItemId,
      description: body.description,
      movedBy: body.movedBy,
      secondedBy: body.secondedBy,
      voteYes: body.voteYes,
      voteNo: body.voteNo,
      voteAbstain: body.voteAbstain,
      outcome: body.outcome,
    })
    return NextResponse.json({ motion })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Motion not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update motion' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; motionId: string }> },
) {
  try {
    await requireStaffUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { motionId } = await params
  try {
    await removeMotion(motionId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Motion not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to remove motion' }, { status: 500 })
  }
}
