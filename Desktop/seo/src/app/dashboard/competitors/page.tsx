'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, TrendingUp, AlertTriangle, Users, Link as LinkIcon, Clock } from 'lucide-react'
import { AddCompetitorDialog } from '@/components/dashboard/add-competitor-dialog'
import { EditCompetitorDialog } from '@/components/dashboard/edit-competitor-dialog'
import { cn } from '@/lib/utils'

interface Competitor {
  id: string
  name: string
  website?: string | null
  createdAt: string
  mentionCount?: number
  lastMentioned?: string
}

export default function Competitors() {
  const { data: session } = useSession()
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null)

  const fetchCompetitors = async () => {
    try {
      const response = await fetch('/api/competitors')
      if (response.ok) {
        const data = await response.json()
        setCompetitors(data)
      }
    } catch (error) {
      console.error('Error fetching competitors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchCompetitors()
    }
  }, [session])

  const handleAddCompetitor = async (competitorData: {
    name: string
    website?: string
  }) => {
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(competitorData),
      })

      if (response.ok) {
        fetchCompetitors()
        setAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding competitor:', error)
    }
  }

  const handleEditCompetitor = async (competitorData: {
    name: string
    website?: string
  }) => {
    if (!editingCompetitor) return

    try {
      const response = await fetch(`/api/competitors/${editingCompetitor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(competitorData),
      })

      if (response.ok) {
        fetchCompetitors()
        setEditDialogOpen(false)
        setEditingCompetitor(null)
      }
    } catch (error) {
      console.error('Error editing competitor:', error)
    }
  }

  const handleDeleteCompetitor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) return

    try {
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCompetitors()
      }
    } catch (error) {
      console.error('Error deleting competitor:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="text-gray-500 font-medium animate-pulse uppercase tracking-widest text-xs">Scanning market...</div>
      </div>
    )
  }

  const totalCompetitors = competitors.length
  const competitorsWithMentions = competitors.filter(c => (c.mentionCount || 0) > 0)
  const mostMentionedCompetitor = competitors.reduce((max, competitor) =>
    (competitor.mentionCount || 0) > (max.mentionCount || 0) ? competitor : max,
    competitors[0]
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Rival <span className="text-primary font-medium tracking-normal text-2xl ml-2">Monitor</span>
          </h1>
          <p className="text-gray-400 font-medium">
            Identify and track competitors stealing your betterSEO real estate.
          </p>
        </div>
        <Button className="rounded-2xl h-12 px-6 shadow-[0_0_20px_rgba(var(--primary),0.3)]" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="font-bold">Track Competitor</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Competitors', value: totalCompetitors, icon: TrendingUp, color: 'primary' },
          { label: 'Active Threats', value: competitorsWithMentions.length, icon: AlertTriangle, color: 'orange-500' },
          { label: 'Market Leader', value: mostMentionedCompetitor?.name.substring(0, 12) || '-', icon: TrendingUp, color: 'emerald-500' }
        ].map((stat, idx) => (
          <Card key={idx} className="glass border-white/5 p-6 hover:border-white/10 transition-glass">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
              <stat.icon className={`h-4 w-4 text-${stat.color}`} />
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
          </Card>
        ))}
      </div>

      {competitors.length === 0 ? (
        <Card className="glass border-white/5 border-dashed bg-transparent p-20 text-center">
          <div className="max-w-md mx-auto space-y-8">
            <div className="w-24 h-24 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-500/20 rotate-12">
              <Users className="h-10 w-10 text-orange-500 -rotate-12" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white mb-4">Market is clear</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                Add competitors to see how they rank against your brand in the eyes of LLMs. We'll track their mention frequency automatically.
              </p>
            </div>
            <Button size="lg" className="rounded-2xl" onClick={() => setAddDialogOpen(true)}>
              Add Your First Rival
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {competitors.map((competitor) => (
            <Card key={competitor.id} className="glass border-white/5 hover:border-white/10 transition-glass group">
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-primary">
                      {competitor.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors">
                        {competitor.name}
                      </h3>
                      {competitor.website && (
                        <a
                          href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center mt-1"
                        >
                          <LinkIcon className="h-3 w-3 mr-1.5" />
                          {competitor.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="outline" className="bg-white/5 text-white border-white/10 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      {competitor.mentionCount || 0} AI Mentions
                    </Badge>
                    {(competitor.mentionCount || 0) > 0 && (
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                        Active Threat
                      </Badge>
                    )}
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                      <Clock className="h-3 w-3 mr-1.5" />
                      Added {new Date(competitor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-6 z-10 shrink-0">
                  {competitor.lastMentioned && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-orange-500/80 uppercase tracking-tight mb-1">Incursion Spotted</p>
                      <p className="text-xs font-bold text-gray-400">{new Date(competitor.lastMentioned).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl h-10 w-10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      onClick={() => {
                        setEditingCompetitor(competitor)
                        setEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl h-10 w-10 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                      onClick={() => handleDeleteCompetitor(competitor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Decorative background number */}
                <div className="absolute -bottom-10 -right-10 text-[120px] font-black text-white/[0.02] select-none pointer-events-none group-hover:text-primary/[0.02] transition-colors">
                  {competitor.mentionCount || 0}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddCompetitorDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddCompetitor}
      />

      <EditCompetitorDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditCompetitor}
        competitor={editingCompetitor}
      />
    </div>
  )
}