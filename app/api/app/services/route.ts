import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { createLicense, listLicenses } from '@/lib/server/data'

export async function GET() {
  try {
    await requireStaffUser()
    const licenseList = await listLicenses()
    return NextResponse.json({ licenses: licenseList })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaffUser()
    const body = await request.json()

    if (!body.type || !body.applicantName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const license = await createLicense({
      type: body.type,
      applicantName: body.applicantName,
      applicantEmail: body.applicantEmail,
      applicantPhone: body.applicantPhone,
      description: body.description,
      fee: body.fee,
    })

    return NextResponse.json({ license }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create license' }, { status: 500 })
  }
}
