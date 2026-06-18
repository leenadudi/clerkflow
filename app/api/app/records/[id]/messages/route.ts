import { NextRequest, NextResponse } from 'next/server'
import { getAppContext } from '@/lib/auth/app'
import { getFoiaThread, sendFoiaMessage } from '@/lib/server/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getAppContext()
    const { id } = await params
    const thread = await getFoiaThread(id)
    return NextResponse.json({ thread })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getAppContext()
    const { id } = await params
    const body = await request.json()

    if (!body.body) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }
    if (!body.authorName) {
      return NextResponse.json({ error: 'authorName is required' }, { status: 400 })
    }
    if (!body.authorRole) {
      return NextResponse.json({ error: 'authorRole is required' }, { status: 400 })
    }

    const ok = await sendFoiaMessage(id, body.body, body.authorName, body.authorRole)
    if (!ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
