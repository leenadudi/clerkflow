'use client'

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

type AuthHeaderControlsProps = {
  signUpLabel?: string
  signInLabel?: string
  showSignUp?: boolean
}

export function AuthHeaderControls({
  signUpLabel = 'Sign up',
  signInLabel = 'Log in',
  showSignUp = true,
}: AuthHeaderControlsProps) {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl="/app">
          <Button variant="ghost" size="sm" className="sm:h-8 sm:px-2.5">
            {signInLabel}
          </Button>
        </SignInButton>
        {showSignUp ? (
          <SignUpButton mode="redirect" forceRedirectUrl="/app/onboarding">
            <Button size="sm" className="sm:h-8 sm:px-2.5">
              {signUpLabel}
            </Button>
          </SignUpButton>
        ) : null}
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'size-8',
            },
          }}
        />
      </Show>
    </>
  )
}
