import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { isDatabaseConfigured } from '@/lib/db'
import { resolveDatabaseUser } from '@/lib/auth/app'
import { completeOnboarding, type OnboardingInput } from '@/lib/server/onboarding'

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await resolveDatabaseUser(userId)
  if (existing) {
    return NextResponse.json({ error: 'Workspace already set up' }, { status: 409 })
  }

  const body = (await request.json()) as {
    townName?: string
    state?: string
    population?: number | string | null
    clerkName?: string
    clerkRole?: string
    clerkEmail?: string
  }
  const rawPopulation = body.population
  let population: number | null = null
  if (rawPopulation !== null && rawPopulation !== undefined && rawPopulation !== '') {
    const parsed = Number(rawPopulation)
    population = Number.isFinite(parsed) ? parsed : null
  }

  try {
    const result = await completeOnboarding(userId, {
      townName: body.townName ?? '',
      state: body.state ?? '',
      population: population,
      clerkName: body.clerkName ?? '',
      clerkRole: body.clerkRole,
      clerkEmail: body.clerkEmail ?? '',
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ALREADY_ONBOARDED') {
        return NextResponse.json({ error: 'Workspace already set up' }, { status: 409 })
      }
      if (error.message === 'INVALID_INPUT') {
        return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
      }
    }
    console.error('[/api/app/onboarding]', error)
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clerkUser = await currentUser()
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    null
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ').trim() ||
    clerkUser?.fullName ||
    email?.split('@')[0] ||
    ''

  const existing = await resolveDatabaseUser(userId, email)

  return NextResponse.json({
    needsOnboarding: !existing,
    defaults: { name, email },
  })
}
