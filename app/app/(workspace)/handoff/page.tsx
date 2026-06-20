'use client'

import { useState } from 'react'
import { Printer } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

type ChecklistItem = {
  id: string
  label: string
}

type Section = {
  id: string
  title: string
  items: ChecklistItem[]
}

const SECTIONS: Section[] = [
  {
    id: 'system-access',
    title: 'System access',
    items: [
      {
        id: 'sa-1',
        label: 'Document all login credentials in a secure password manager',
      },
      { id: 'sa-2', label: 'Add new clerk to Clerkflow as an admin user' },
      {
        id: 'sa-3',
        label: "Transfer Gmail integration to new clerk's account",
      },
      {
        id: 'sa-4',
        label: 'Update clerk email on town website and all external platforms',
      },
      {
        id: 'sa-5',
        label: 'Notify state agencies of clerk change with new contact info',
      },
    ],
  },
  {
    id: 'key-contacts',
    title: 'Key contacts',
    items: [
      { id: 'kc-1', label: 'Share contact info for town attorney' },
      {
        id: 'kc-2',
        label: 'Share contact info for state auditor / financial officer',
      },
      {
        id: 'kc-3',
        label: 'Share contact info for IT support / website vendor',
      },
      {
        id: 'kc-4',
        label: 'Share contact info for state municipal clerks association',
      },
      {
        id: 'kc-5',
        label: 'Provide list of board/commission chairs with contact info',
      },
    ],
  },
  {
    id: 'active-matters',
    title: 'Active matters',
    items: [
      {
        id: 'am-1',
        label: 'Review all open FOIA requests and their deadlines',
      },
      { id: 'am-2', label: 'Review all pending permit applications' },
      {
        id: 'am-3',
        label: 'Document any ongoing board vacancies or pending appointments',
      },
      { id: 'am-4', label: 'Note any upcoming meetings already scheduled' },
      {
        id: 'am-5',
        label: 'Flag any compliance deadlines due in the next 90 days',
      },
    ],
  },
  {
    id: 'documents-records',
    title: 'Documents & records',
    items: [
      {
        id: 'dr-1',
        label: 'Confirm records retention schedule is up to date',
      },
      {
        id: 'dr-2',
        label: 'Locate and share access to physical records room / filing system',
      },
      {
        id: 'dr-3',
        label: 'Export last 12 months of Clerkflow data as backup',
      },
      {
        id: 'dr-4',
        label: 'Provide location of seal, signature stamp, and official documents',
      },
      {
        id: 'dr-5',
        label: "Document location of town's official contracts and agreements",
      },
    ],
  },
]

const ALL_ITEMS = SECTIONS.flatMap((s) => s.items)

export default function HandoffPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const totalItems = ALL_ITEMS.length
  const checkedCount = checked.size
  const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Handoff"
        description="Prepare a complete transition package for the next clerk."
        breadcrumbs={[{ label: 'Admin', href: '/app/tools' }, { label: 'Handoff' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="size-4" aria-hidden />
            Print handoff package
          </Button>
        }
      />

      {/* Progress bar */}
      <div className="mt-6 rounded-lg border border-border bg-surface p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Overall progress</span>
          <span className="text-[#475569]">
            {checkedCount} of {totalItems} complete
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#1e3a5f] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={checkedCount}
            aria-valuemin={0}
            aria-valuemax={totalItems}
            aria-label={`${checkedCount} of ${totalItems} items complete`}
          />
        </div>
        {checkedCount === totalItems && totalItems > 0 && (
          <p className="mt-2 text-sm font-medium text-[#16a34a]">
            All items complete. This clerk is ready to hand off.
          </p>
        )}
      </div>

      {/* Checklist sections */}
      <div className="mt-4 flex flex-col gap-4">
        {SECTIONS.map((section) => {
          const sectionChecked = section.items.filter((i) => checked.has(i.id)).length
          const sectionTotal = section.items.length

          return (
            <Card key={section.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {section.title}
                  </CardTitle>
                  <span className="text-xs text-[#475569]">
                    {sectionChecked} of {sectionTotal} complete
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                {section.items.map((item) => {
                  const isChecked = checked.has(item.id)
                  return (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-3"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(_checked: boolean) => toggle(item.id)}
                        className="mt-0.5 shrink-0"
                        aria-label={item.label}
                      />
                      <span
                        className={`text-sm leading-snug ${
                          isChecked
                            ? 'text-[#475569] line-through'
                            : 'text-foreground'
                        }`}
                      >
                        {item.label}
                      </span>
                    </label>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
