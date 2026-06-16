'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Calendar,
  FileText,
  ClipboardList,
  Users,
  UserSquare2,
  Send,
  Upload,
  BarChart3,
  ShieldCheck,
  Settings,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TOWN } from '@/lib/data'

const WORKSPACE = [
  { label: 'Command Center', href: '/app', icon: LayoutGrid },
  { label: 'Meetings', href: '/app/meetings', icon: Calendar },
  { label: 'FOIA', href: '/app/foia', icon: FileText, badge: 2 },
  { label: 'Services', href: '/app/services', icon: ClipboardList },
  { label: 'Boards', href: '/app/boards', icon: Users },
  { label: 'Residents', href: '/app/residents', icon: UserSquare2 },
  { label: 'Publish', href: '/app/publish', icon: Send },
]

const MANAGE = [
  { label: 'Import', href: '/app/import', icon: Upload },
  { label: 'Reports', href: '/app/reports', icon: BarChart3 },
  { label: 'Compliance', href: '/app/compliance', icon: ShieldCheck },
  { label: 'Settings', href: '/app/settings', icon: Settings },
]

function NavLink({
  item,
  active,
}: {
  item: { label: string; href: string; icon: typeof LayoutGrid; badge?: number }
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-semibold text-destructive-foreground">
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}

export function SidebarNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/app' ? pathname === '/app' : pathname.startsWith(href)

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Shield className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">Clerkflow</p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            {TOWN.shortName}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Workspace
        </p>
        <div className="flex flex-col gap-1">
          {WORKSPACE.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>

        <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Manage
        </p>
        <div className="flex flex-col gap-1">
          {MANAGE.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
          {TOWN.clerk.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{TOWN.clerk.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            {TOWN.clerk.role}
          </p>
        </div>
      </div>
    </div>
  )
}
