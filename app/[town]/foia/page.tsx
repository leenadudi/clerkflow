import Link from 'next/link'
import { FoiaForm } from './_components/foia-form'

export default async function TownFoiaPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: townSlug } = await params

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 md:px-6">
      <h1 className="text-2xl font-bold text-foreground">Submit a public records request</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You have the right to inspect and obtain copies of public records. Fill out the form
        below and the clerk's office will respond within the statutory timeframe. No account
        required.
      </p>

      <div className="mt-8">
        <FoiaForm townSlug={townSlug} />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-muted/30 px-5 py-4 text-sm">
        <p className="font-medium text-foreground">Already submitted a request?</p>
        <Link href={`/${townSlug}/track`} className="mt-1 inline-block text-primary hover:underline">
          Track your request status →
        </Link>
      </div>
    </main>
  )
}
