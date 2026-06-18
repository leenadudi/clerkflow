import { NextRequest, NextResponse } from 'next/server'
import { getAppContext } from '@/lib/auth/app'
import { getFoiaAuditLog } from '@/lib/server/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getAppContext()
    const { id } = await params
    const log = await getFoiaAuditLog(id)
    return NextResponse.json({ log })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
