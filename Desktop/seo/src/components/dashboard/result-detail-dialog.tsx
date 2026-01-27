'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle, Rocket, Loader2, Sparkles } from 'lucide-react'
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

interface ResultDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: MonitorResult | null
}

export function ResultDetailDialog({ open, onOpenChange, result }: ResultDetailDialogProps) {
  const [roadmap, setRoadmap] = useState<string | null>(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)

  if (!result) return null

  const handleGenerateRoadmap = async () => {
    setLoadingRoadmap(true)
    try {
      const response = await fetch('/api/results/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resultId: result.id }),
      })
      if (response.ok) {
        const data = await response.json()
        setRoadmap(data.roadmap)
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error)
    } finally {
      setLoadingRoadmap(false)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setRoadmap(null)
    }
    onOpenChange(open)
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto glass p-0 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] outline-none!">
        <div className="relative">
          {/* Header Section */}
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1">
                <Badge variant="outline" className={cn("mb-2 text-[10px] px-2 py-0 border font-bold uppercase tracking-wider", getCategoryColor(result.prompt.category))}>
                  {result.prompt.category.replace('_', ' ')}
                </Badge>
                <DialogTitle className="text-3xl font-black text-white leading-tight">
                  Analysis <span className="text-primary font-medium tracking-normal text-2xl ml-2">Report</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400 font-medium">
                  Detailed breakdown of the AI's understanding and brand placement.
                </DialogDescription>
              </div>
              <div className={cn(
                "p-4 rounded-3xl border flex items-center justify-center shadow-lg",
                result.brandMentioned ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
              )}>
                {result.brandMentioned ? <CheckCircle className="h-8 w-8 text-emerald-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-3">Target Query</p>
              <p className="text-xl font-bold text-white leading-relaxed italic">
                "{result.prompt.promptText}"
              </p>
            </div>
          </div>

          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AI Response Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.26em] flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" />
                  AI Logic Response
                </h3>
                <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 max-h-[400px] overflow-y-auto">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {result.responseText}
                  </p>
                </div>
              </div>

              {/* Insights & Competitors */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.26em]">Summary Insights</h3>
                  <div className="space-y-3">
                    <div className={cn(
                      "p-4 rounded-2xl border flex items-center space-x-3",
                      result.brandMentioned ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
                    )}>
                      {result.brandMentioned ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className={cn("text-xs font-bold uppercase tracking-tight", result.brandMentioned ? "text-emerald-400" : "text-red-400")}>
                        {result.brandMentioned ? 'Brand was successfully cited' : 'Brand was not discovered'}
                      </span>
                    </div>

                    {result.competitorsMentioned.length > 0 ? (
                      <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 space-y-3">
                        <div className="flex items-center space-x-3 text-orange-400">
                          <Rocket className="h-4 w-4 rotate-180" />
                          <span className="text-xs font-bold uppercase tracking-tight">Competitors Spotted ({result.competitorsMentioned.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.competitorsMentioned.map((c, i) => (
                            <Badge key={i} className="bg-orange-500/10 text-orange-400 border-orange-500/20 rounded-lg px-2 py-0.5 text-[10px]">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center space-x-3 text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-tight">No direct competitors mentioned</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sources Section */}
                {result.sources && result.sources.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.26em]">Influence Sources</h3>
                    <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5">
                      <ul className="space-y-3">
                        {result.sources.map((source, index) => (
                          <li key={index} className="flex items-center space-x-3 group">
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-primary transition-colors" />
                            <a
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-gray-400 hover:text-white truncate font-medium transition-colors"
                            >
                              {source.replace(/^https?:\/\//, '')}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visibility Analysis & Roadmap */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Visibility Strategy</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Strategic recommendations based on the AI response.</p>
                </div>
                {!result.brandMentioned && !roadmap && (
                  <Button
                    onClick={handleGenerateRoadmap}
                    disabled={loadingRoadmap}
                    className="rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                  >
                    {loadingRoadmap ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-3" />
                    ) : (
                      <Rocket className="h-4 w-4 mr-3" />
                    )}
                    Generate Recovery Roadmap
                  </Button>
                )}
              </div>

              {roadmap && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-6 duration-700">
                  <div className="flex items-center space-x-3 text-primary">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Rocket className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-xl tracking-tight">Recovery Roadmap</h4>
                  </div>
                  <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                      <Rocket className="h-32 w-32 text-primary" />
                    </div>
                    <div className="text-gray-300 whitespace-pre-wrap text-[15px] leading-relaxed relative z-10 font-medium">
                      {roadmap}
                    </div>
                  </div>
                  <div className="bg-orange-500/5 p-6 rounded-3xl border border-orange-500/10 text-xs text-orange-400 group flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-widest mb-1">Strategist Pro Tip</p>
                      <p className="text-orange-300/80 leading-relaxed">Implement these recommendations and wait for the next iteration cycle. Re-analyze this prompt in 14-21 days for best results.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}