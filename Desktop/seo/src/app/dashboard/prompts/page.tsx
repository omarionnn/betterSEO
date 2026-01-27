'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Play, Edit, Trash2, Sparkles, Loader2, Eye, MessageSquare } from 'lucide-react'
import { AddPromptDialog } from '@/components/dashboard/add-prompt-dialog'
import { EditPromptDialog } from '@/components/dashboard/edit-prompt-dialog'
import { GeneratePromptsDialog } from '@/components/dashboard/generate-prompts-dialog'
import { ResultDetailDialog } from '@/components/dashboard/result-detail-dialog'
import { cn } from '@/lib/utils'

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
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)

  // New States for Progress
  const [checkingIds, setCheckingIds] = useState<Record<string, string>>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [finishedResults, setFinishedResults] = useState<Record<string, any>>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedResult, setSelectedResult] = useState<any | null>(null)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)

  const loadingMessages = [
    "Initializing research...",
    "Searching live web via Tavily...",
    "Scanning brand mentions...",
    "Analyzing competitor presence...",
    "Evaluating AI visibility score...",
    "Finalizing report..."
  ]

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

  const handleAddPrompt = async (data: { promptText: string; category: string; priority: string }) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchPrompts()
        setAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding prompt:', error)
    }
  }

  const handleEditPrompt = async (data: { promptText: string; category: string; priority: string }) => {
    if (!editingPrompt) return

    try {
      const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  const handleBulkAddPrompts = async (newPrompts: Array<{ text: string; category: string }>) => {
    try {
      const promises = newPrompts.map(p =>
        fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptText: p.text,
            category: p.category,
            priority: 'MEDIUM'
          })
        })
      )

      await Promise.all(promises)
      fetchPrompts()
    } catch (error) {
      console.error('Error bulk adding prompts:', error)
      throw error
    }
  }

  const handleCheckPrompt = async (id: string) => {
    let messageIndex = 0
    setCheckingIds(prev => ({ ...prev, [id]: loadingMessages[0] }))

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length
      setCheckingIds(prev => ({ ...prev, [id]: loadingMessages[messageIndex] }))
    }, 2000)

    try {
      const response = await fetch(`/api/prompts/${id}/check`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setFinishedResults(prev => ({ ...prev, [id]: data.result }))
      }
    } catch (error) {
      console.error('Error checking prompt:', error)
    } finally {
      clearInterval(interval)
      setCheckingIds(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const handleViewResult = (id: string) => {
    const result = finishedResults[id]
    if (result) {
      const currentPrompt = prompts.find(p => p.id === id)
      setSelectedResult({
        ...result,
        prompt: currentPrompt,
        checkedAt: new Date().toISOString()
      })
      setResultDialogOpen(true)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PRODUCT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'SERVICE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'COMPARISON': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'HOW_TO': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="text-gray-400 font-medium animate-pulse uppercase tracking-widest text-xs">Syncing library...</div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Monitor <span className="text-primary font-medium tracking-normal text-2xl ml-2">Vault</span>
          </h1>
          <p className="text-gray-400 font-medium">
            Strategic queries used to benchmark your betterSEO visibility.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="glass border-white/10 hover:bg-white/5 rounded-2xl h-12 px-6" onClick={() => setGenerateDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="font-bold">Discover</span>
          </Button>
          <Button className="rounded-2xl h-12 px-6 shadow-[0_0_20px_rgba(var(--primary),0.3)]" onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="font-bold">New Prompt</span>
          </Button>
        </div>
      </div>

      {prompts.length === 0 ? (
        <Card className="glass border-white/5 border-dashed bg-transparent p-20 text-center">
          <div className="max-w-md mx-auto space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20 rotate-12">
              <MessageSquare className="h-10 w-10 text-primary -rotate-12" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white mb-4">The Vault is empty</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Start your visibility journey by adding custom queries or use our AI Discovery engine to brainstorm high-intent prompts.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="rounded-2xl" onClick={() => setAddDialogOpen(true)}>
                Add Manual Prompt
              </Button>
              <Button size="lg" variant="outline" className="glass border-white/10 rounded-2xl" onClick={() => setGenerateDialogOpen(true)}>
                Auto-Discover
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="glass border-white/5 hover:border-white/10 transition-glass group">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge variant="outline" className={cn("text-[10px] px-2 py-0 border font-bold uppercase tracking-wider", getCategoryColor(prompt.category))}>
                      {prompt.category.replace('_', ' ')}
                    </Badge>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full ring-4 ring-white/5",
                      prompt.priority === 'HIGH' ? "bg-red-500" : prompt.priority === 'MEDIUM' ? "bg-orange-500" : "bg-blue-500"
                    )} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{prompt.priority} Priority</span>
                  </div>
                  <p className="text-xl font-bold text-white leading-snug group-hover:text-primary transition-colors">
                    {prompt.promptText}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {checkingIds[prompt.id] ? (
                    <div className="flex items-center bg-primary/10 text-primary px-5 py-3 rounded-2xl text-xs font-black border border-primary/20 animate-pulse uppercase tracking-widest">
                      <Loader2 className="h-4 w-4 animate-spin mr-3" />
                      {checkingIds[prompt.id]}
                    </div>
                  ) : finishedResults[prompt.id] ? (
                    <Button
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-6 shadow-lg shadow-emerald-500/20"
                      onClick={() => handleViewResult(prompt.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Analysis
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="rounded-2xl px-6 bg-white/5 hover:bg-white/10 border-white/5 text-white"
                      onClick={() => handleCheckPrompt(prompt.id)}
                      disabled={!prompt.isActive}
                    >
                      <Play className="h-4 w-4 mr-2 fill-current" />
                      Run Baseline
                    </Button>
                  )}

                  <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl h-10 w-10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      onClick={() => {
                        setEditingPrompt(prompt)
                        setEditDialogOpen(true)
                      }}
                      disabled={!!checkingIds[prompt.id]}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl h-10 w-10 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                      onClick={() => handleDeletePrompt(prompt.id)}
                      disabled={!!checkingIds[prompt.id]}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
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

      <GeneratePromptsDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onAddPrompts={handleBulkAddPrompts}
      />

      <ResultDetailDialog
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
        result={selectedResult}
      />
    </div>
  )
}