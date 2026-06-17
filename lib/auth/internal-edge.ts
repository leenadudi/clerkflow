import type { NextRequest } from 'next/server'

export const INTERNAL_SESSION_COOKIE = 'clerkflow_internal_session'

export function getInternalSecretFromEnv(): string {
  return (
    process.env.INTERNAL_PASSWORD?.trim() ||
    process.env.INTERNAL_SECRET?.trim() ||
    ''
  )
}

/** Edge-safe gate: cookie must exist. API routes verify the signature. */
export function hasInternalSessionCookie(request: NextRequest): boolean {
  const secret = getInternalSecretFromEnv()
  if (!secret) return true
  return Boolean(request.cookies.get(INTERNAL_SESSION_COOKIE)?.value)
}
