import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { createBoardTerm, listBoardTerms } from '@/lib/server/data'

export async function GET() {
  try {
    await requireStaffUser()
    const terms = await listBoardTerms()
    return NextResponse.json({ terms })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaffUser()
    const body = await request.json()

    if (!body.memberName || !body.boardName || !body.seat || !body.expiresAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const term = await createBoardTerm({
      memberName: body.memberName,
      boardName: body.boardName,
      seat: body.seat,
      expiresAt: new Date(body.expiresAt),
    })

    return NextResponse.json({ term }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create board term' }, { status: 500 })
  }
}
