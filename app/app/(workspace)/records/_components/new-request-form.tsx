'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function NewRequestForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [source, setSource] = useState('web')
  const [formatRequested, setFormatRequested] = useState('any')
  const [deliveryMethod, setDeliveryMethod] = useState('email')
  const [priority, setPriority] = useState('normal')

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setError('')
      setIsAnonymous(false)
      setSource('web')
      setFormatRequested('any')
      setDeliveryMethod('email')
      setPriority('normal')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const body = {
      source,
      requesterName: isAnonymous ? 'Anonymous' : (form.get('requesterName') as string),
      isAnonymous,
      requesterEmail: form.get('requesterEmail') || undefined,
      requesterPhone: form.get('requesterPhone') || undefined,
      requesterOrganization: form.get('requesterOrganization') || undefined,
      description: form.get('description') as string,
      dateRangeFrom: form.get('dateRangeFrom') || undefined,
      dateRangeTo: form.get('dateRangeTo') || undefined,
      formatRequested,
      deliveryMethod,
      priority,
    }

    const res = await fetch('/api/app/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (!res.ok) {
      setError('Failed to create request. Please try again.')
      return
    }

    const result = await res.json()
    setOpen(false)
    router.push(`/app/records/${result.request.id}`)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New request
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New records request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Source */}
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={source} onValueChange={(v) => setSource(v ?? 'web')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="mail">Mail</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isAnonymous"
                checked={isAnonymous}
                onCheckedChange={(checked: boolean | 'indeterminate') => setIsAnonymous(checked === true)}
              />
              <Label htmlFor="isAnonymous" className="cursor-pointer font-normal">
                Anonymous request
              </Label>
            </div>

            {/* Requester name — hidden when anonymous */}
            {!isAnonymous && (
              <div className="space-y-1.5">
                <Label htmlFor="requesterName">Requester name</Label>
                <Input
                  id="requesterName"
                  name="requesterName"
                  required
                  placeholder="Full name"
                />
              </div>
            )}

            {/* Email and phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="requesterEmail">
                  Email{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="requesterEmail"
                  name="requesterEmail"
                  type="email"
                  placeholder="optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="requesterPhone">
                  Phone{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="requesterPhone"
                  name="requesterPhone"
                  type="tel"
                  placeholder="optional"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-1.5">
              <Label htmlFor="requesterOrganization">
                Organization{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="requesterOrganization"
                name="requesterOrganization"
                placeholder="optional"
              />
            </div>

            {/* Request description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">What records are you requesting?</Label>
              <Textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe the records being requested…"
                className="resize-none"
              />
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dateRangeFrom">
                  Date range from{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input id="dateRangeFrom" name="dateRangeFrom" type="date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateRangeTo">
                  To{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input id="dateRangeTo" name="dateRangeTo" type="date" />
              </div>
            </div>

            {/* Format requested */}
            <div className="space-y-1.5">
              <Label>Format requested</Label>
              <Select value={formatRequested} onValueChange={(v) => setFormatRequested(v ?? 'any')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any format</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="physical">Physical copy</SelectItem>
                  <SelectItem value="certified">Certified copy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery method */}
            <div className="space-y-1.5">
              <Label>Delivery method</Label>
              <Select value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v ?? 'email')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in_person">In-person pickup</SelectItem>
                  <SelectItem value="mail">Mail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v ?? 'normal')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="expedited">Expedited</SelectItem>
                </SelectContent>
              </Select>
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
                {loading ? 'Creating…' : 'Create request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
