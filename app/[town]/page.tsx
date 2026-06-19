import Link from 'next/link'
import {
  Calendar,
  FileText,
  ClipboardCheck,
  FileSearch,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default async function ResidentHomePage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town: slug } = await params

  const ACTIONS = [
    {
      icon: Calendar,
      title: 'View meetings & minutes',
      desc: 'Agendas, minutes, and upcoming council and board meetings.',
      href: `/${slug}/meetings`,
    },
    {
      icon: FileText,
      title: 'Submit a public records request',
      desc: 'Request documents under state public records law. No account needed.',
      href: `/${slug}/foia`,
    },
    {
      icon: ClipboardCheck,
      title: 'Apply for a license or permit',
      desc: 'Dog licenses, vendor permits, burn permits, and event applications.',
      href: `/${slug}/apply`,
    },
    {
      icon: FileSearch,
      title: 'Track my request',
      desc: 'Check the status of a submission with your confirmation number.',
      href: `/${slug}/track`,
    },
  ]

  return (
    <main className="flex-1">
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 md:px-6">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            How can we help you today?
          </h1>
          <p className="mt-2 max-w-xl text-primary-foreground/80">
            Most town services are available online — no account needed.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-5xl px-4 pb-16 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent">
                  <CardContent className="flex h-full flex-col p-6">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <h2 className="mt-4 text-base font-semibold text-foreground">
                      {action.title}
                    </h2>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {action.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
