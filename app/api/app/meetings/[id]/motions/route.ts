import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { addMotion } from '@/lib/server/data'

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
    if (!body.description) {
      return NextResponse.json({ error: 'Missing required field: description' }, { status: 400 })
    }
    const motion = await addMotion(id, {
      agendaItemId: body.agendaItemId,
      description: body.description,
      movedBy: body.movedBy,
      secondedBy: body.secondedBy,
      voteYes: body.voteYes,
      voteNo: body.voteNo,
      voteAbstain: body.voteAbstain,
      outcome: body.outcome,
    })
    return NextResponse.json({ motion }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to add motion' }, { status: 500 })
  }
}
