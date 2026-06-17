import { Suspense } from 'react'
import InternalLoginForm from './login-form'

export default function InternalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <InternalLoginForm />
    </Suspense>
  )
}
