import { type NextRequest, NextResponse } from 'next/server'
import { pollAllConnections } from '@/lib/gmail/poll'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pollAllConnections()
    return NextResponse.json(result)
  } catch (err) {
    console.error('Poll error:', err)
    return NextResponse.json({ error: 'Poll failed' }, { status: 500 })
  }
}
