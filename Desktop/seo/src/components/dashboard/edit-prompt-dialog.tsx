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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Prompt {
  id: string
  promptText: string
  category: 'PRODUCT' | 'SERVICE' | 'COMPARISON' | 'HOW_TO'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  isActive: boolean
}

interface EditPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    promptText: string
    category: string
    priority: string
  }) => void
  prompt: Prompt | null
}

export function EditPromptDialog({ open, onOpenChange, onSubmit, prompt }: EditPromptDialogProps) {
  const [promptText, setPromptText] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (prompt) {
      setPromptText(prompt.promptText)
      setCategory(prompt.category)
      setPriority(prompt.priority)
    } else {
      setPromptText('')
      setCategory('')
      setPriority('')
    }
  }, [prompt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!promptText.trim() || !category || !priority) {
      return
    }

    setLoading(true)
    
    try {
      await onSubmit({
        promptText: promptText.trim(),
        category,
        priority,
      })
    } catch (error) {
      console.error('Error updating prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
          <DialogDescription>
            Update your prompt settings and content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="promptText">Prompt Text</Label>
              <Textarea
                id="promptText"
                placeholder="e.g., What are the best project management tools for small teams?"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="COMPARISON">Comparison</SelectItem>
                  <SelectItem value="HOW_TO">How-to</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
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
              {loading ? 'Updating...' : 'Update Prompt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}