import { SignUp } from '@clerk/nextjs'

export default function AppSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your workspace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up Clerkflow for your town
          </p>
        </div>
        <SignUp
          routing="path"
          path="/app/sign-up"
          signInUrl="/app/login"
          forceRedirectUrl="/app/onboarding"
        />
      </div>
    </div>
  )
}
