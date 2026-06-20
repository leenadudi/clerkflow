import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { INTERNAL_SESSION_COOKIE } from '@/lib/auth/internal-edge'

export { INTERNAL_SESSION_COOKIE } from '@/lib/auth/internal-edge'
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function getInternalSecret(): string {
  return (
    process.env.INTERNAL_PASSWORD?.trim() ||
    process.env.INTERNAL_SECRET?.trim() ||
    ''
  )
}

export function isInternalAuthConfigured(): boolean {
  return getInternalSecret().length > 0
}

export function verifyInternalPassword(password: string): boolean {
  const secret = getInternalSecret()
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('INTERNAL_PASSWORD must be set in production.')
    }
    return true
  }
  if (password.length !== secret.length) return false
  return timingSafeEqual(Buffer.from(password), Buffer.from(secret))
}

export function createSessionToken(): string {
  const secret = getInternalSecret()
  const payload = `authenticated:${Date.now()}`
  const signature = createHmac('sha256', secret || 'dev')
    .update(payload)
    .digest('hex')
  return `${payload}:${signature}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false

  const secret = getInternalSecret()
  if (!secret) return true

  const lastColon = token.lastIndexOf(':')
  if (lastColon === -1) return false

  const payload = token.slice(0, lastColon)
  const signature = token.slice(lastColon + 1)
  if (!payload.startsWith('authenticated:')) return false

  const timestamp = Number(payload.split(':')[1])
  if (!Number.isFinite(timestamp)) return false

  const age = Date.now() - timestamp
  if (age < 0 || age > SESSION_MAX_AGE_MS) return false

  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  if (signature.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export function getSessionFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(INTERNAL_SESSION_COOKIE)?.value
}

export function assertInternalAccess(request: NextRequest): boolean {
  const secret = getInternalSecret()
  if (!secret) return true

  const session = getSessionFromRequest(request)
  if (session && verifySessionToken(session)) return true

  const header = request.headers.get('x-internal-secret')
  const urlSecret = new URL(request.url).searchParams.get('secret')
  return header === secret || urlSecret === secret
}

export const internalSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_MS / 1000,
}
