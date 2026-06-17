import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { createFoiaRequest, listFoiaRequests } from '@/lib/server/data'

export async function GET() {
  try {
    await requireStaffUser()
    const requests = await listFoiaRequests()
    return NextResponse.json({ requests })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaffUser()
    const body = await request.json()

    if (!body.title || !body.requesterName || !body.summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const foia = await createFoiaRequest({
      title: body.title,
      requesterName: body.requesterName,
      requesterEmail: body.requesterEmail,
      summary: body.summary,
      assignedUserId: body.assignedUserId,
    })

    return NextResponse.json({ request: foia }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
