import { ApplyForm } from './_components/apply-form'

export default async function TownApplyPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: townSlug } = await params

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 md:px-6">
      <h1 className="text-2xl font-bold text-foreground">Apply for a license or permit</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Submit an application online. The clerk's office will review it and follow up with next
        steps, including any fees due. No account required.
      </p>

      <div className="mt-8">
        <ApplyForm townSlug={townSlug} />
      </div>
    </main>
  )
}
