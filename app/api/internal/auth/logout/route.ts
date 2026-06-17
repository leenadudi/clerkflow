import { NextResponse } from 'next/server'
import { INTERNAL_SESSION_COOKIE } from '@/lib/auth/internal'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(INTERNAL_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
