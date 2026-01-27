'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BarChart3, ChevronRight, Search, TrendingUp, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (session) {
    return null
  }

  return (
    <div className="min-h-screen bg-mesh selection:bg-primary/30 overflow-hidden">
      {/* Navigation */}
      <nav className="glass-header border-b border-white/5 py-6">
        <div className="container mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              betterSEO
            </h1>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/auth/signin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/signup">
              <Button className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20">Join Orbit</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-8">
        {/* Hero Section */}
        <div className="pt-32 pb-24 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">BetterSEO V1.0 is now live</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700">
            Dominate the <span className="bg-gradient-to-br from-primary via-purple-400 to-emerald-400 bg-clip-text text-transparent">AI Response</span> Era.
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Stop guessing your visibility. Track brand citations, analyze competitor incursions, and optimize for the LLM economy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/auth/signup">
              <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 group">
                Begin Monitoring
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="glass h-16 px-12 rounded-2xl font-black text-lg border-white/10 hover:bg-white/5">
                Enterprise Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-24 border-t border-white/5">
          {[
            {
              title: "AER Intelligence",
              desc: "Deep-learning models to track your brand mentions across ChatGPT, Perplexity, and more.",
              icon: Search,
              color: "text-primary"
            },
            {
              title: "Competitor Incursions",
              desc: "Real-time alerts when rivals steal your industry real estate in AI suggestions.",
              icon: TrendingUp,
              color: "text-emerald-400"
            },
            {
              title: "Recovery Maps",
              desc: "Automated, AI-generated roadmaps to regain lost visibility and cited status.",
              icon: Rocket,
              color: "text-orange-400"
            }
          ].map((item, i) => (
            <Card key={i} className="glass border-white/5 p-10 hover:border-white/10 transition-glass group">
              <div className="mb-8 p-4 bg-white/5 rounded-3xl w-fit group-hover:scale-110 transition-transform">
                <item.icon className={cn("h-8 w-8", item.color)} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight">{item.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between text-gray-600 font-bold text-xs uppercase tracking-widest">
          <p>© 2026 betterSEO Intel. Built for the future of search.</p>
          <div className="flex space-x-10 mt-6 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
