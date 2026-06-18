'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const COMMON_BOARDS = [
  'Planning Commission',
  'Board of Zoning Appeals',
  'Parks & Recreation Board',
  'Historical Preservation Board',
  'Board of Health',
  'Cemetery Board',
]

export function AddMemberForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const body = {
      memberName: form.get('memberName'),
      boardName: form.get('boardName'),
      seat: form.get('seat'),
      expiresAt: form.get('expiresAt'),
    }

    const res = await fetch('/api/app/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (!res.ok) {
      setError('Failed to add member. Please try again.')
      return
    }

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add member
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add board member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="memberName">Member name</Label>
            <Input id="memberName" name="memberName" required placeholder="Full name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="boardName">Board</Label>
            <Input
              id="boardName"
              name="boardName"
              required
              placeholder="e.g. Planning Commission"
              list="board-suggestions"
            />
            <datalist id="board-suggestions">
              {COMMON_BOARDS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seat">Seat / role</Label>
            <Input id="seat" name="seat" required placeholder="e.g. Seat 1, Chair" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiresAt">Term expires</Label>
            <Input id="expiresAt" name="expiresAt" type="date" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding…' : 'Add member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
