'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, BarChart3, TrendingUp, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalPrompts: number
  mentionRate: number
  lastCheck: string | null
  totalCompetitors: number
  totalChecks: number
  performanceDelta: number
  competitorImpact: Array<{ name: string; count: number }>
  mentionTrend: Array<{ date: string; rate: number }>
  setupSteps: Array<{ id: string; completed: boolean }>
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="text-gray-400 font-medium animate-pulse uppercase tracking-widest text-xs">Syncing Overview...</div>
      </div>
    )
  }

  const steps = [
    { title: 'Add Your First Prompt', desc: 'Define how you want to be seen by AI models.', completed: stats?.setupSteps.find(s => s.id === 'add-prompt')?.completed },
    { title: 'Run Your First Check', desc: 'Baseline your current visibility across platforms.', completed: stats?.setupSteps.find(s => s.id === 'run-check')?.completed },
    { title: 'Track Competitors', desc: 'Identify which rivals are stealing your limelight.', completed: stats?.setupSteps.find(s => s.id === 'track-competitors')?.completed }
  ]

  const showInsights = (stats?.totalChecks || 0) >= 5

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Pulse <span className="text-primary font-medium tracking-normal text-2xl ml-2">Overview</span>
          </h1>
          <p className="text-gray-400 font-medium">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Operator'}. Here&apos;s your brand&apos;s betterSEO health.
          </p>
        </div>
        <div />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="glass border-white/5 hover:border-primary/30 transition-glass group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">Inventory</CardTitle>
            <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{stats?.totalPrompts || 0}</div>
            <div className="mt-2 flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              <span className="text-primary mr-1">Strategic</span> Prompts
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 hover:border-emerald-500/30 transition-glass group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">Reach</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2">
              <div className="text-4xl font-black text-white">{stats?.mentionRate || 0}%</div>
              {stats?.performanceDelta !== 0 && (
                <div className={cn(
                  "text-[10px] font-bold mb-1 px-1.5 py-0.5 rounded-lg border",
                  (stats?.performanceDelta || 0) > 0
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {(stats?.performanceDelta || 0) > 0 ? '+' : ''}{stats?.performanceDelta}%
                </div>
              )}
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              Total Mention Rate
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 hover:border-orange-500/30 transition-glass group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">Freshness</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">
              {stats?.lastCheck ? new Date(stats.lastCheck).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              Latest Protocol Sync
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 hover:border-blue-500/30 transition-glass group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">Intelligence</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">{stats?.totalCompetitors || 0}</div>
            <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              Rivals Monitored
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.02] p-6">
            <CardTitle className="text-lg font-black text-white italic">Getting Started <span className="text-primary ml-2 uppercase text-[10px] tracking-[0.2em] font-black non-italic">Setup Protocol</span></CardTitle>
            <CardDescription className="text-gray-400 font-medium">Complete these steps to optimize your betterSEO visibility.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y divide-white/5">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <div className="flex items-center space-x-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border transition-all shadow-xl",
                      step.completed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-gray-500 border-white/10"
                    )}>
                      {step.completed ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div>
                      <p className={cn("font-black italic text-lg transition-colors", step.completed ? "text-emerald-400" : "text-white group-hover:text-primary")}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">{step.desc}</p>
                    </div>
                  </div>
                  {step.completed ? (
                    <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                      <ChevronRight className="h-5 w-5 text-emerald-400" />
                    </div>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {showInsights ? (
          <Card className="glass border-white/5 p-8 flex flex-col space-y-8 animate-in zoom-in-95 duration-700">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white italic tracking-tight">Insights Engine</h3>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">LIVE</Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Visibility Trend</p>
                  <div className="flex items-end justify-between h-24 gap-1">
                    {stats?.mentionTrend.map((t, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div
                          className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-lg relative"
                          style={{ height: `${Math.max(t.rate, 10)}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 whitespace-nowrap">
                            {t.rate}% Reach
                          </div>
                        </div>
                        <p className="text-[8px] font-bold text-gray-500 mt-2 uppercase">{t.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Market Incursion</p>
                  <div className="space-y-3">
                    {stats?.competitorImpact.map((c, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/40" />
                          <p className="text-[11px] font-bold text-white">{c.name}</p>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase">{c.count} Mentions</p>
                      </div>
                    ))}
                    {(stats?.competitorImpact?.length === 0) && (
                      <p className="text-xs text-gray-500 italic">No rival incursion detected.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto bg-white/[0.03] p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-medium text-gray-400 italic leading-relaxed">
                Strategic focus: {stats?.mentionRate || 0 > 50 ? "Dominating" : "Expanding"} market presence via category comparisons.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="glass border-white/5 border-dashed bg-transparent p-1 group overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-full w-full rounded-[calc(var(--radius)-4px)] bg-white/[0.01] border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8 relative z-10">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 rotate-6 group-hover:rotate-0 transition-all duration-500">
                <BarChart3 className="h-10 w-10 text-gray-600 -rotate-6 group-hover:rotate-0 transition-all duration-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 italic tracking-tight">Insights Engine</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Comprehensive visibility trends and recovery maps will activate once you&apos;ve conducted 5 protocol checks.
              </p>
              <div className="mt-6 flex items-center space-x-2">
                <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(stats?.totalChecks || 0) / 5 * 100}%` }} />
                </div>
                <span className="text-[10px] font-black text-primary uppercase">{stats?.totalChecks || 0}/5 Checks</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}