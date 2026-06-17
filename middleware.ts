import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getInternalSecretFromEnv,
  hasInternalSessionCookie,
} from '@/lib/auth/internal-edge'

const isAppRoute = createRouteMatcher(['/app(.*)'])
const isPublicAppRoute = createRouteMatcher([
  '/app/login(.*)',
  '/app/sign-up(.*)',
  '/app/onboarding(.*)',
])

function handleInternalAuth(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = getInternalSecretFromEnv()

  if (!secret) return NextResponse.next()

  const isAuthed = hasInternalSessionCookie(request)

  if (pathname.startsWith('/internal/login')) {
    if (isAuthed) {
      const next = request.nextUrl.searchParams.get('next') || '/internal/prospects'
      return NextResponse.redirect(new URL(next, request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/internal')) {
    if (isAuthed) return NextResponse.next()

    const login = new URL('/internal/login', request.url)
    login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  if (pathname.startsWith('/api/prospects')) {
    if (isAuthed) return NextResponse.next()

    const header = request.headers.get('x-internal-secret')
    if (header === secret) return NextResponse.next()

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (pathname.startsWith('/api/internal/')) {
    if (pathname === '/api/internal/auth/login') return NextResponse.next()
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/internal') ||
    pathname.startsWith('/api/prospects') ||
    pathname.startsWith('/api/internal/')
  ) {
    return handleInternalAuth(request)
  }

  if (isAppRoute(request) && !isPublicAppRoute(request)) {
    if (process.env.CLERK_SECRET_KEY) {
      await auth.protect()
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
