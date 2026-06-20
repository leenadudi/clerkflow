import { ApplyForm } from '@/app/[town]/apply/_components/apply-form'

export default async function EmbedApplyPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: townSlug } = await params

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold text-foreground">Apply for a licence or permit</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Submit your application online. The clerk's office will follow up with next steps.
      </p>

      <div className="mt-4">
        <ApplyForm townSlug={townSlug} />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Powered by{' '}
        <a href="https://clerkflow.software" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Clerkflow
        </a>
      </p>
    </div>
  )
}
