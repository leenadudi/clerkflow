import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { createFoiaRequest, listFoiaRequests } from '@/lib/server/data'

export async function GET() {
  try {
    await requireStaffUser()
    const requests = await listFoiaRequests()
    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaffUser()
    const body = await request.json()

    const isAnonymous = Boolean(body.isAnonymous)

    // Accept 'description' as the primary text field (form sends this)
    const description: string = body.description || body.summary || ''
    if (!description) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }
    if (!isAnonymous && !body.requesterName) {
      return NextResponse.json({ error: 'requesterName is required' }, { status: 400 })
    }

    // Derive a title from the first line / first ~80 chars of the description
    const title: string = body.title || description.split('\n')[0].slice(0, 80)

    const record = await createFoiaRequest({
      title,
      requesterName: isAnonymous ? 'Anonymous' : body.requesterName,
      requesterEmail: body.requesterEmail,
      requesterPhone: body.requesterPhone,
      requesterOrg: body.requesterOrg ?? body.requesterOrganization,
      isAnonymous,
      summary: description,
      source: body.source,
      formatRequested: body.formatRequested,
      deliveryMethod: body.deliveryMethod,
      priority: body.priority,
      dateRangeFrom: body.dateRangeFrom ? new Date(body.dateRangeFrom) : undefined,
      dateRangeTo: body.dateRangeTo ? new Date(body.dateRangeTo) : undefined,
      deadlineDays: body.deadlineDays,
    })

    return NextResponse.json({ request: record }, { status: 201 })
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
