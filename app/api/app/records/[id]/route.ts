import { NextRequest, NextResponse } from 'next/server'
import { getAppContext } from '@/lib/auth/app'
import {
  denyFoiaRequest,
  fulfillFoiaRequest,
  getFoiaRequest,
  updateFoiaInternalNotes,
  updateFoiaStatus,
} from '@/lib/server/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getAppContext()
    const { id } = await params
    const request = await getFoiaRequest(id)
    if (!request) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ request })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getAppContext()
    const { id } = await params
    const body = await request.json()

    if (body.action === 'fulfill') {
      await fulfillFoiaRequest(id, body.note)
      return NextResponse.json({ ok: true })
    }

    if (body.action === 'deny') {
      await denyFoiaRequest(id, body.reason)
      return NextResponse.json({ ok: true })
    }

    if (body.status) {
      await updateFoiaStatus(id, body.status as string)
      return NextResponse.json({ ok: true })
    }

    if (typeof body.internalNotes === 'string') {
      await updateFoiaInternalNotes(id, body.internalNotes)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
