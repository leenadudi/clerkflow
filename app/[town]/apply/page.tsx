import { ResidentHeader } from '@/components/resident/header'
import { ApplyForm } from './_components/apply-form'

export default async function TownApplyPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: townSlug } = await params

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ResidentHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Apply for a license or permit</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit an application online. The clerk's office will review it and follow up with
            next steps, including any fees due.
          </p>
        </div>

        <ApplyForm townSlug={townSlug} />
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-xl px-4 py-6 text-xs text-muted-foreground md:px-6">
          Powered by Clerkflow
        </div>
      </footer>
    </div>
  )
}
