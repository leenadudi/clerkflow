import Link from 'next/link'
import { Shield } from 'lucide-react'

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="size-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Clerkflow
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The clerk operating system designed specifically for small towns.
              Built for local government.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { label: 'Overview', href: '/product' },
                { label: 'For Small Towns', href: '/for-small-towns' },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Clerkflow. clerkflow.software</p>
          <p>Made for US municipal clerks.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
