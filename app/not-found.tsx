import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/app"
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go to dashboard
      </Link>
    </div>
  )
}
