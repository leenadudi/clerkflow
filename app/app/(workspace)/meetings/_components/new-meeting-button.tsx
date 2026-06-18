'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type MeetingTypeValue =
  | 'council'
  | 'planning'
  | 'zoning'
  | 'special'
  | 'workshop'
  | 'other'

const MEETING_TYPES: { value: MeetingTypeValue; label: string }[] = [
  { value: 'council', label: 'Council' },
  { value: 'planning', label: 'Planning Commission' },
  { value: 'zoning', label: 'Zoning Board' },
  { value: 'special', label: 'Special Meeting' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
]

const DEFAULT_TITLES: Record<MeetingTypeValue, string> = {
  council: 'Regular Council Meeting',
  planning: 'Planning Commission',
  zoning: 'Zoning Board of Appeals',
  special: 'Special Meeting',
  workshop: 'Council Workshop',
  other: '',
}

const BODY_LABELS: Record<MeetingTypeValue, string> = {
  council: 'Town Council',
  planning: 'Planning Commission',
  zoning: 'Zoning Board',
  special: 'Special Meeting',
  workshop: 'Workshop',
  other: '',
}

export function NewMeetingButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [meetingType, setMeetingType] = useState<MeetingTypeValue>('council')
  const [title, setTitle] = useState(DEFAULT_TITLES['council'])

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value as MeetingTypeValue
    setMeetingType(val)
    setTitle(DEFAULT_TITLES[val])
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Reset form state when closing
      setMeetingType('council')
      setTitle(DEFAULT_TITLES['council'])
      setError('')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const date = form.get('date') as string
    const time = form.get('time') as string
    const startsAt = new Date(`${date}T${time}`).toISOString()

    const body = {
      title: form.get('title'),
      body: BODY_LABELS[meetingType] || (form.get('title') as string),
      startsAt,
      location: form.get('location'),
      meetingType,
      internalNotes: form.get('internalNotes') || '',
    }

    const res = await fetch('/api/app/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (!res.ok) {
      setError('Failed to create meeting. Please try again.')
      return
    }

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New meeting
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New meeting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Meeting type */}
            <div className="space-y-1.5">
              <Label htmlFor="meetingType">Meeting type</Label>
              <select
                id="meetingType"
                name="meetingType"
                value={meetingType}
                onChange={handleTypeChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {MEETING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Title (pre-filled, editable) */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Regular Council Meeting"
              />
            </div>

            {/* Row 3: Date | Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" required />
              </div>
            </div>

            {/* Row 4: Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                required
                placeholder="e.g. Town Hall, Main Chamber"
              />
            </div>

            {/* Row 5: Internal notes (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="internalNotes">
                Internal notes{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="internalNotes"
                name="internalNotes"
                rows={3}
                placeholder="Notes visible only to staff — not published"
                className="resize-none"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create meeting'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
