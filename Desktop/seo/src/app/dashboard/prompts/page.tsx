'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Play, Edit, Trash2 } from 'lucide-react'
import { AddPromptDialog } from '@/components/dashboard/add-prompt-dialog'
import { EditPromptDialog } from '@/components/dashboard/edit-prompt-dialog'

interface Prompt {
  id: string
  promptText: string
  category: 'PRODUCT' | 'SERVICE' | 'COMPARISON' | 'HOW_TO'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function Prompts() {
  const { data: session } = useSession()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts')
      if (response.ok) {
        const data = await response.json()
        setPrompts(data)
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchPrompts()
    }
  }, [session])

  const handleAddPrompt = async (promptData: {
    promptText: string
    category: string
    priority: string
  }) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      })

      if (response.ok) {
        fetchPrompts()
        setAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding prompt:', error)
    }
  }

  const handleEditPrompt = async (promptData: {
    promptText: string
    category: string
    priority: string
  }) => {
    if (!editingPrompt) return

    try {
      const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      })

      if (response.ok) {
        fetchPrompts()
        setEditDialogOpen(false)
        setEditingPrompt(null)
      }
    } catch (error) {
      console.error('Error editing prompt:', error)
    }
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPrompts()
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
    }
  }

  const handleCheckPrompt = async (id: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}/check`, {
        method: 'POST',
      })

      if (response.ok) {
        // Handle success - maybe show a success message
        console.log('Prompt check initiated')
      }
    } catch (error) {
      console.error('Error checking prompt:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PRODUCT': return 'bg-blue-100 text-blue-800'
      case 'SERVICE': return 'bg-green-100 text-green-800'
      case 'COMPARISON': return 'bg-purple-100 text-purple-800'
      case 'HOW_TO': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading prompts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompts</h1>
          <p className="text-gray-600 mt-2">
            Create and manage prompts to monitor your AI visibility
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Prompt
        </Button>
      </div>

      {prompts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No prompts yet</CardTitle>
            <CardDescription>
              Get started by creating your first prompt to monitor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Prompt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {prompt.promptText}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge className={getCategoryColor(prompt.category)}>
                        {prompt.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(prompt.priority)}>
                        {prompt.priority}
                      </Badge>
                      {!prompt.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleCheckPrompt(prompt.id)}
                      disabled={!prompt.isActive}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPrompt(prompt)
                        setEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePrompt(prompt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPromptDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddPrompt}
      />

      <EditPromptDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditPrompt}
        prompt={editingPrompt}
      />
    </div>
  )
}