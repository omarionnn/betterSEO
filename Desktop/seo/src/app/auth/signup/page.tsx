'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

import { UserPlus, ChevronLeft, Building2, User as UserIcon } from 'lucide-react'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    website: '',
    industry: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          website: formData.website,
          industry: formData.industry
        }),
      })

      if (response.ok) {
        router.push('/auth/signin?message=Registration successful')
      } else {
        const data = await response.json()
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-6 py-12">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-40 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <Card className="w-full max-w-lg glass border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] text-center relative">
          <Link href="/" className="absolute left-8 top-10 text-gray-500 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto mb-6">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black text-white tracking-tight mb-2">Join Orbit</CardTitle>
          <CardDescription className="text-gray-400 font-medium italic">
            Begin your journey into deep betterSEO intelligence.
          </CardDescription>

          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step === 1 ? 'bg-primary' : 'bg-white/10'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step === 2 ? 'bg-primary' : 'bg-white/10'}`} />
          </div>
        </div>

        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center space-x-3 text-primary mb-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personal Identity</span>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Elexis Vance"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary text-white font-medium"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Communication Protocol</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="elexis@orbit.com"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary text-white font-medium"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Encryption Cipher</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary text-white font-medium"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Verify Cipher</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary text-white font-medium"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <Button type="button" onClick={() => setStep(2)} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 group">
                  Add Brand Context
                  <ChevronLeft className="ml-2 h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center space-x-3 text-emerald-400 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Organization Context</span>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Brand Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Aperture Science"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-white font-medium"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="website" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Main Domain</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="aperture.com"
                      className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-white font-medium"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="industry" className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Market Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      placeholder="Research & Dev"
                      className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-white font-medium"
                      value={formData.industry}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest p-4 rounded-xl text-center">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-14 px-6 rounded-2xl font-black border-white/10 hover:bg-white/5">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button type="submit" className="flex-1 h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? 'Initializing...' : 'Establish Profile'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              Existing Operator?{' '}
              <Link href="/auth/signin" className="text-primary hover:text-primary/80 transition-colors ml-2 underline underline-offset-4 decoration-2">
                Authorize Access
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Establishing Global betterSEO Encryption Node</p>
      </div>
    </div>
  )
}