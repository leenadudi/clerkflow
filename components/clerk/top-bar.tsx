'use client'

import { UserButton } from '@clerk/nextjs'
import { Menu, Search, Bell, MessageSquare } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarNav } from './sidebar-nav'
import { ChatPanel } from './chat-panel'
import { useWorkspace } from './workspace-context'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type SearchResult = {
  type: string
  id: string
  title: string
  subtitle: string
  href: string
}

const TYPE_LABELS: Record<string, string> = {
  foia: 'Public Records',
  meeting: 'Meetings',
  permit: 'Permits',
}

export function TopBar() {
  const { town } = useWorkspace()
  const [chatOpen, setChatOpen] = useState(false)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Debounced fetch
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/app/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results ?? [])
          setOpen(true)
        }
      } catch {
        // ignore fetch errors silently
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    if (!acc[result.type]) acc[result.type] = []
    acc[result.type].push(result)
    return acc
  }, {})

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <Sheet>
        <SheetTrigger
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground md:text-base">
          {town.name}
        </h2>
        <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
          Pop. {town.population}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div ref={wrapperRef} className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search meetings, FOIA, residents..."
            className="h-9 w-64 rounded-full bg-secondary pl-9 lg:w-80"
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true)
            }}
          />

          {/* Dropdown */}
          {open && (results.length > 0 || loading) && (
            <div className="absolute top-full mt-1 w-full rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
              {loading && results.length === 0 ? (
                <div className="px-3 py-2.5 text-sm text-muted-foreground">Searching…</div>
              ) : (
                Object.entries(grouped).map(([type, items]) => (
                  <div key={type}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50">
                      {TYPE_LABELS[type] ?? type}
                    </div>
                    {items.map((result) => (
                      <Link
                        key={result.href}
                        href={result.href}
                        onClick={() => {
                          setOpen(false)
                          setQuery('')
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-sm"
                      >
                        <div>
                          <div className="font-medium text-foreground">{result.title}</div>
                          <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
        </Button>
        <Button
          variant="ghost"
          aria-label="Ask Clerkie"
          onClick={() => setChatOpen((o) => !o)}
          className={`gap-1.5 px-3 text-sm font-medium ${chatOpen ? 'bg-muted' : ''}`}
        >
          <MessageSquare className="size-4" />
          <span className="hidden sm:inline">Ask Clerkie</span>
        </Button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'size-8',
            },
          }}
        />
      </div>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </header>
  )
}
