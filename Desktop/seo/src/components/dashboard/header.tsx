'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="glass-header border-b-white/5 border-b py-4">
      <div className="px-8 flex items-center justify-between mx-auto max-w-7xl">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white/90">Overview</h2>
        </div>
        <div className="flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 px-3 py-6 rounded-2xl hover:bg-white/5 transition-all outline-none!">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/40 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  {session?.user?.name?.[0] || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-white leading-tight">{session?.user?.name || 'User'}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{session?.user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass w-56 p-2 rounded-2xl">
              <DropdownMenuLabel className="text-gray-400 font-bold uppercase text-[10px] tracking-widest px-4 py-3">Account Settings</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={() => signOut()} className="rounded-xl px-4 py-3 focus:bg-white/5 cursor-pointer text-red-400 hover:text-red-300 transition-colors">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-bold text-sm">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}