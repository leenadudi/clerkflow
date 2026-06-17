import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAppContext } from '@/lib/auth/app'
import { OnboardingForm } from './_components/onboarding-form'

export default async function OnboardingPage() {
  const context = await getAppContext()
  if (context.user) {
    redirect('/app')
  }

  const clerkUser = await currentUser()
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    ''
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ').trim() ||
    clerkUser?.fullName ||
    email.split('@')[0] ||
    ''

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Set up your town workspace
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A few details so Clerkflow knows which town you work for and who you are.
      </p>
      <div className="mt-8">
        <OnboardingForm defaultName={name} defaultEmail={email} />
      </div>
    </div>
  )
}
