import { MarketingFooter } from '@/components/marketing/footer'
import { MarketingHeader } from '@/components/marketing/header'
import { PageHeader } from '@/components/page-header'
import { ResidentHeader } from '@/components/resident/header'
import { Card, CardContent } from '@/components/ui/card'

type PageShellProps = {
  title: string
  description?: string
  children?: React.ReactNode
  variant?: 'marketing' | 'app' | 'resident'
}

export function PageShell({
  title,
  description,
  children,
  variant = 'marketing',
}: PageShellProps) {
  const content = (
    <>
      <PageHeader title={title} description={description} />
      {children ?? (
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              This page is a placeholder. Content coming soon.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  )

  if (variant === 'app') {
    return <div className="mx-auto max-w-5xl">{content}</div>
  }

  if (variant === 'resident') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <ResidentHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6">
          {content}
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6">
        {content}
      </main>
      <MarketingFooter />
    </div>
  )
}
