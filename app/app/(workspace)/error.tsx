'use client'

import { useEffect } from 'react'

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Workspace error:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <pre className="mt-4 rounded-lg bg-muted/50 p-4 text-left text-xs text-destructive overflow-auto">
        {process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred. Please try again or contact support.'
          : `${error.message}\n${error.stack}`}
      </pre>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  )
}
