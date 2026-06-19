import type { PublicTown } from '@/lib/server/public-data'

export function ResidentFooter({ town }: { town: PublicTown }) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground md:px-6">
        <p className="font-medium text-foreground">{town.name}</p>
        <p className="mt-1">Town Hall · Open Monday–Friday, 9 AM–4 PM</p>
        {town.clerkEmail && (
          <p className="mt-1">
            <a href={`mailto:${town.clerkEmail}`} className="hover:underline">
              {town.clerkEmail}
            </a>
          </p>
        )}
        <p className="mt-4 text-xs">Powered by Clerkflow</p>
      </div>
    </footer>
  )
}
