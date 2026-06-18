import { NextRequest, NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { getLicense, updateLicenseStatus } from '@/lib/server/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaffUser()
    const { id } = await params
    const license = await getLicense(id)
    if (!license) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ license })
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

    const validStatuses = ['pending', 'approved', 'denied', 'expired'] as const
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const license = await updateLicenseStatus(id, body.status)
    if (!license) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ license })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update license' }, { status: 500 })
  }
}
