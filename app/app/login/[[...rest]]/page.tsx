import { SignIn } from '@clerk/nextjs'

export default function AppLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Clerkflow
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your town workspace
          </p>
        </div>
        <SignIn
          routing="path"
          path="/app/login"
          signUpUrl="/app/sign-up"
          forceRedirectUrl="/app"
        />
      </div>
    </div>
  )
}
