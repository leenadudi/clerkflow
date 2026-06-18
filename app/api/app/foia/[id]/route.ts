import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import {
  addFoiaMessage,
  getFoiaRequest,
  getFoiaThread,
  getFoiaWorkflow,
  updateFoiaStatus,
} from '@/lib/server/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaffUser()
    const { id } = await params
    const request = await getFoiaRequest(id)
    if (!request) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const [thread, workflow] = await Promise.all([
      getFoiaThread(id),
      getFoiaWorkflow(id),
    ])

    return NextResponse.json({ request, thread, workflow })
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
    const { id } = await params
    const body = await request.json()

    if (body.status) {
      const ok = await updateFoiaStatus(id, body.status as string)
      if (!ok) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      const updated = await getFoiaRequest(id)
      return NextResponse.json({ request: updated })
    }

    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await requireStaffUser()
    const { id } = await params
    const body = await request.json()

    if (!body.body) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }

    const message = await addFoiaMessage(id, body.body)
    if (!message) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ message, author: context.user.name }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
