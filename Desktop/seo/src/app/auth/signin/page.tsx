'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        }
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-6">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-40 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <Card className="w-full max-w-md glass border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto mb-6">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</CardTitle>
          <CardDescription className="text-gray-400 font-medium italic">
            Authorize your access to betterSEO intelligence.
          </CardDescription>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@domain.com"
                className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary text-white font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary text-white font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest p-4 rounded-xl text-center animate-shake">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              New Recruiter?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 transition-colors ml-2 underline underline-offset-4 decoration-2">
                Join betterSEO
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Secure betterSEO Connection Active</p>
      </div>
    </div>
  )
}