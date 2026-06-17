import { NextRequest, NextResponse } from 'next/server'
import { trackPublicFoia } from '@/lib/server/data'

export async function GET(request: NextRequest) {
  const town = request.nextUrl.searchParams.get('town')
  const code = request.nextUrl.searchParams.get('code')

  if (!town || !code) {
    return NextResponse.json({ error: 'town and code are required' }, { status: 400 })
  }

  const result = await trackPublicFoia(town, code.toUpperCase())
  if (!result) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  return NextResponse.json(result)
}
