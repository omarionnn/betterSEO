'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { ResultDetailDialog } from '@/components/dashboard/result-detail-dialog'

interface MonitorResult {
  id: string
  platform: string
  brandMentioned: boolean
  responseText: string
  competitorsMentioned: string[]
  checkedAt: string
  prompt: {
    id: string
    promptText: string
    category: string
    priority: string
  }
}

export default function Results() {
  const { data: session } = useSession()
  const [results, setResults] = useState<MonitorResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<MonitorResult | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results')
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchResults()
    }
  }, [session])

  const handleViewDetails = (result: MonitorResult) => {
    setSelectedResult(result)
    setDetailDialogOpen(true)
  }

  const getStatusIcon = (brandMentioned: boolean) => {
    return brandMentioned ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getStatusColor = (brandMentioned: boolean) => {
    return brandMentioned
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading results...</div>
      </div>
    )
  }

  const mentionRate = results.length > 0 
    ? Math.round((results.filter(r => r.brandMentioned).length / results.length) * 100)
    : 0

  const recentResults = results.slice(0, 10)
  const totalChecks = results.length
  const brandMentions = results.filter(r => r.brandMentioned).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Results</h1>
        <p className="text-gray-600 mt-2">
          View your AI monitoring results and brand visibility insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChecks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Mentions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brandMentions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mention Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {results.length > 0 
                ? new Date(results[0].checkedAt).toLocaleDateString()
                : '-'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No results yet</CardTitle>
            <CardDescription>
              Run some prompt checks to see your AI visibility results here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Go to the Prompts page and click the "Check Now" button on any active prompt to start monitoring your brand visibility.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
            <CardDescription>
              Your latest AI monitoring results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getStatusIcon(result.brandMentioned)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.prompt.promptText}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCategoryColor(result.prompt.category)}>
                          {result.prompt.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(result.brandMentioned)}>
                          {result.brandMentioned ? 'Mentioned' : 'Not Mentioned'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(result.checkedAt).toLocaleString()}
                        </span>
                      </div>
                      {result.competitorsMentioned.length > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Competitors mentioned: {result.competitorsMentioned.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(result)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ResultDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        result={selectedResult}
      />
    </div>
  )
}