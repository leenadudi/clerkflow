import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { addAgendaItem } from '@/lib/server/data'

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
    if (!body.title) {
      return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 })
    }
    const item = await addAgendaItem(id, {
      title: body.title,
      detail: body.detail,
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not found') {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to add agenda item' }, { status: 500 })
  }
}
