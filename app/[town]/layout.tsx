import { notFound } from 'next/navigation'
import { ResidentHeader } from '@/components/resident/header'
import { ResidentFooter } from '@/components/resident/footer'
import { getTownBySlug } from '@/lib/server/public-data'

export default async function TownLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ town: string }>
}) {
  const { town: slug } = await params
  const town = await getTownBySlug(slug)
  if (!town) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ResidentHeader town={town} />
      {children}
      <ResidentFooter town={town} />
    </div>
  )
}
