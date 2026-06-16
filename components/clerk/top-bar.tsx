'use client'

import { Menu, Search, Bell, HelpCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarNav } from './sidebar-nav'
import { TOWN } from '@/lib/data'

export function TopBar() {
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
          {TOWN.name}
        </h2>
        <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
          Pop. {TOWN.population}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search meetings, FOIA, residents..."
            className="h-9 w-64 rounded-full bg-secondary pl-9 lg:w-80"
            aria-label="Search"
          />
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
        <Button variant="ghost" size="icon" aria-label="Help">
          <HelpCircle className="size-5" />
        </Button>
      </div>
    </header>
  )
}
