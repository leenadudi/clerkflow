import { NextRequest, NextResponse } from 'next/server'
import { submitPublicLicense } from '@/lib/server/data'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ town: string }> },
) {
  const { town: townSlug } = await params

  try {
    const body = await request.json()
    if (!body.type || !body.applicantName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await submitPublicLicense(townSlug, {
      type: body.type,
      applicantName: body.applicantName,
      applicantEmail: body.applicantEmail,
      applicantPhone: body.applicantPhone,
      description: body.description,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Town not found') {
      return NextResponse.json({ error: 'Town not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
