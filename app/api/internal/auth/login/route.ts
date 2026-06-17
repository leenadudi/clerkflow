import { NextRequest, NextResponse } from 'next/server'
import {
  createSessionToken,
  getInternalSecret,
  internalSessionCookieOptions,
  INTERNAL_SESSION_COOKIE,
  verifyInternalPassword,
} from '@/lib/auth/internal'

export async function POST(request: NextRequest) {
  const secret = getInternalSecret()
  if (!secret) {
    const token = createSessionToken()
    const response = NextResponse.json({ ok: true, devMode: true })
    response.cookies.set(INTERNAL_SESSION_COOKIE, token, internalSessionCookieOptions)
    return response
  }

  const body = (await request.json()) as { password?: string }
  if (!body.password || !verifyInternalPassword(body.password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = createSessionToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(INTERNAL_SESSION_COOKIE, token, internalSessionCookieOptions)
  return response
}
