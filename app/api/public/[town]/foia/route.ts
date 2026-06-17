import { NextRequest, NextResponse } from 'next/server'
import { submitPublicFoia } from '@/lib/server/data'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ town: string }> },
) {
  const { town } = await params
  const body = await request.json()

  if (!body.title || !body.requesterName || !body.summary) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const result = await submitPublicFoia(town, {
      title: body.title,
      requesterName: body.requesterName,
      requesterEmail: body.requesterEmail,
      summary: body.summary,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Town not found') {
      return NextResponse.json({ error: 'Town not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}
