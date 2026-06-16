import { cn } from '@/lib/utils'
import { MarketingFooter } from '@/components/marketing/footer'
import { MarketingHeader } from '@/components/marketing/header'

export function MarketingPageLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 py-10 md:px-6 md:py-16',
          className ?? 'max-w-6xl',
        )}
      >
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}
