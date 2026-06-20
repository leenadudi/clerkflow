import { notFound } from 'next/navigation'
import { getTownBySlug } from '@/lib/server/public-data'
import '@/app/globals.css'

export default async function EmbedLayout({
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
    <div className="min-h-screen bg-background font-sans antialiased">
      {children}
    </div>
  )
}
