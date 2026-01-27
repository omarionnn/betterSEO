'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Eye, TrendingUp, BarChart3 } from 'lucide-react'
import { ResultDetailDialog } from '@/components/dashboard/result-detail-dialog'
import { cn } from '@/lib/utils'

interface MonitorResult {
  id: string
  platform: string
  brandMentioned: boolean
  responseText: string
  competitorsMentioned: string[]
  checkedAt: string
  sources: string[]
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
      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
        <XCircle className="h-5 w-5 text-red-500" />
      </div>
    )
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
        <div className="text-gray-500 font-medium animate-pulse uppercase tracking-widest text-xs">Fetching insights...</div>
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Intelligence <span className="text-primary font-medium tracking-normal text-2xl ml-2">Ledger</span>
          </h1>
          <p className="text-gray-400 font-medium">
            Strategic historical analysis of your AI presence.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5 group shadow-xl transition-all"
          onClick={fetchResults}
        >
          <BarChart3 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
          <span className="font-bold">Sync Ledger</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Checks', value: totalChecks, icon: Clock, color: 'primary' },
          { label: 'Brand Mentions', value: brandMentions, icon: CheckCircle, color: 'emerald-500' },
          { label: 'Mention Rate', value: `${mentionRate}%`, icon: TrendingUp, color: 'purple-500' },
          { label: 'Protocol Date', value: results.length > 0 ? new Date(results[0].checkedAt).toLocaleDateString() : '-', icon: Clock, color: 'orange-500' }
        ].map((stat, idx) => (
          <Card key={idx} className="glass border-white/5 p-6 hover:border-white/10 transition-glass group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
              <stat.icon className={`h-4 w-4 text-${stat.color} group-hover:scale-125 transition-transform`} />
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
          </Card>
        ))}
      </div>

      {results.length === 0 ? (
        <Card className="glass border-white/5 border-dashed bg-transparent p-24 text-center">
          <div className="max-w-md mx-auto space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 rotate-6 group hover:rotate-0 transition-transform">
              <BarChart3 className="h-10 w-10 text-gray-600" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white mb-4 italic">Ledger Empty</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                No intelligence data discovered. Execute dynamic prompts to begin populating your brand&apos;s AI response history.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="glass border-white/5 overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5 bg-white/[0.02] p-10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-white italic tracking-tight">Activity Feed</CardTitle>
              <CardDescription className="text-gray-400 font-medium">Your latest AI monitoring results across all platforms.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-8 hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleViewDetails(result)}>
                  <div className="flex items-start space-x-8 flex-1 min-w-0">
                    {getStatusIcon(result.brandMentioned)}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-black text-white group-hover:text-primary transition-colors leading-tight mb-2 truncate">
                        &quot;{result.prompt.promptText}&quot;
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Badge variant="outline" className={cn("text-[10px] px-3 py-1 border-2 font-black uppercase tracking-widest rounded-xl", getCategoryColor(result.prompt.category))}>
                          {result.prompt.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px] px-3 py-1 border-2 font-black uppercase tracking-widest rounded-xl", result.brandMentioned ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                          {result.brandMentioned ? 'Mentioned' : 'Not Mentioned'}
                        </Badge>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-2 opacity-50" />
                          {new Date(result.checkedAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {result.competitorsMentioned.length > 0 && (
                        <div className="mt-4 flex items-center space-x-3 bg-white/5 w-fit px-4 py-2 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black text-orange-500/80 uppercase tracking-widest shrink-0">Competitors Spotted:</span>
                          <div className="flex gap-2 overflow-hidden">
                            {result.competitorsMentioned.map((c, i) => (
                              <span key={i} className="text-[10px] font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-lg">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center ml-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 shadow-lg group-hover:border-primary/50">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="bg-white/[0.04] p-6 text-center border-t border-white/5">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Historical Integrity Verified</p>
          </div>
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