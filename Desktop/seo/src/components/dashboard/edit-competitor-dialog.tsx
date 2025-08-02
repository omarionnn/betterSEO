'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Competitor {
  id: string
  name: string
  website?: string | null
}

interface EditCompetitorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    website?: string
  }) => void
  competitor: Competitor | null
}

export function EditCompetitorDialog({ open, onOpenChange, onSubmit, competitor }: EditCompetitorDialogProps) {
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (competitor) {
      setName(competitor.name)
      setWebsite(competitor.website || '')
    } else {
      setName('')
      setWebsite('')
    }
  }, [competitor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      return
    }

    setLoading(true)
    
    try {
      await onSubmit({
        name: name.trim(),
        website: website.trim() || undefined,
      })
    } catch (error) {
      console.error('Error updating competitor:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Competitor</DialogTitle>
          <DialogDescription>
            Update competitor information and website.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Competitor Name</Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Competitor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}