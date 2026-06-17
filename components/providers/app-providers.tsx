'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}
