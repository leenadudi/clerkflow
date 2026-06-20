import { FoiaForm } from '@/app/[town]/foia/_components/foia-form'

export default async function EmbedFoiaPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: townSlug } = await params

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold text-foreground">Submit a public records request</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        No account required. You'll receive a confirmation number to track your request.
      </p>

      <div className="mt-4">
        <FoiaForm townSlug={townSlug} />
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
