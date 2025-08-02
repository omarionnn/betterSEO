'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, TrendingUp, AlertTriangle } from 'lucide-react'
import { AddCompetitorDialog } from '@/components/dashboard/add-competitor-dialog'
import { EditCompetitorDialog } from '@/components/dashboard/edit-competitor-dialog'

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
        method: 'PUT',
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading competitors...</div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitors</h1>
          <p className="text-gray-600 mt-2">
            Track and analyze your competitors' visibility in AI responses
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Competitors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompetitors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitorsWithMentions.length}</div>
            <p className="text-xs text-muted-foreground">
              Competitors mentioned in AI responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Competitor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostMentionedCompetitor?.name.substring(0, 10) || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostMentionedCompetitor?.mentionCount || 0} mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {competitors.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No competitors tracked yet</CardTitle>
            <CardDescription>
              Add competitors to track their visibility alongside your brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Competitor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {competitors.map((competitor) => (
            <Card key={competitor.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {competitor.name}
                      </h3>
                      {competitor.website && (
                        <a 
                          href={competitor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🔗 {competitor.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {competitor.mentionCount || 0} mentions
                        </Badge>
                        {(competitor.mentionCount || 0) > 0 && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Active threat
                          </Badge>
                        )}
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        Added {new Date(competitor.createdAt).toLocaleDateString()}
                      </span>
                      
                      {competitor.lastMentioned && (
                        <span className="text-sm text-orange-600">
                          Last mentioned: {new Date(competitor.lastMentioned).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        {(competitor.mentionCount || 0) > 0 
                          ? `This competitor has been mentioned ${competitor.mentionCount} time(s) in AI responses to your prompts.`
                          : 'This competitor has not been mentioned in any AI responses yet.'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCompetitor(competitor)
                        setEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCompetitor(competitor.id)}
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