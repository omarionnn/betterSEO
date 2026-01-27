'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Users,
  Settings
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Prompts',
    href: '/dashboard/prompts',
    icon: MessageSquare,
  },
  {
    name: 'Results',
    href: '/dashboard/results',
    icon: BarChart3,
  },
  {
    name: 'Competitors',
    href: '/dashboard/competitors',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-72 min-h-screen bg-sidebar backdrop-blur-3xl border-r border-white/5 flex flex-col sticky top-0">
      <div className="p-8">
        <div className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            betterSEO
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <div className="mb-6 px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Main Menu
          </p>
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className={cn(
                'mr-3 h-5 w-5 transition-transform group-hover:scale-110',
                isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-6">
        <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
          <p className="text-xs font-bold text-primary mb-1">Pro Plan</p>
          <p className="text-[10px] text-gray-400">Unlimited AI Monitoring</p>
        </div>
      </div>
    </div>
  )
}