import { NextResponse } from 'next/server'
import { requireStaffUser } from '@/lib/auth/app'
import { pollAllConnections } from '@/lib/gmail/poll'

export async function POST() {
  try {
    await requireStaffUser()
    const result = await pollAllConnections()
    return NextResponse.json(result)
  } catch (err) {
    console.error('Poll-now error:', err)
    return NextResponse.json({ error: 'Failed to poll' }, { status: 500 })
  }
}
