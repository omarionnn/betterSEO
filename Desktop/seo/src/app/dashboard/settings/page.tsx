'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, User, Key } from 'lucide-react'

export default function Settings() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companyIndustry, setCompanyIndustry] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserName(data.name || '')
        setUserEmail(data.email || '')
        setCompanyName(data.company?.name || '')
        setCompanyWebsite(data.company?.website || '')
        setCompanyIndustry(data.company?.industry || '')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchUserData()
    }
  }, [session])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
        }),
      })

      if (response.ok) {
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/user/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: companyName,
          website: companyWebsite,
          industry: companyIndustry,
        }),
      })

      if (response.ok) {
        alert('Company information updated successfully!')
      } else {
        alert('Failed to update company information')
      }
    } catch (error) {
      console.error('Error updating company:', error)
      alert('Error updating company information')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        alert('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error changing password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="text-gray-400 font-medium animate-pulse uppercase tracking-widest text-xs">Loading preferences...</div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">
          Control <span className="text-primary font-medium tracking-normal text-2xl ml-2">Center</span>
        </h1>
        <p className="text-gray-400 font-medium">
          Manage your account, organization, and security protocols.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl h-14 w-full md:w-auto overflow-x-auto no-scrollbar">
          <TabsTrigger value="profile" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold text-xs uppercase tracking-widest">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold text-xs uppercase tracking-widest">
            <Building className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold text-xs uppercase tracking-widest">
            <Key className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in fade-in duration-500">
          <Card className="glass border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02] p-8">
              <CardTitle className="text-xl font-bold">Personal Profile</CardTitle>
              <CardDescription className="text-gray-400 font-medium">Your identity within the betterSEO network.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                <div className="space-y-3">
                  <Label htmlFor="userName" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Name</Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter full name"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary text-white font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="userEmail" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Protocol</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary text-white font-medium"
                  />
                </div>
                <Button type="submit" disabled={saving} className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                  {saving ? 'Syncing...' : 'Update Records'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="animate-in fade-in duration-500">
          <Card className="glass border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02] p-8">
              <CardTitle className="text-xl font-bold">Organization Details</CardTitle>
              <CardDescription className="text-gray-400 font-medium">Define your brand context for improved AI analysis.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateCompany} className="space-y-6 max-w-xl">
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Brand Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="BetterSEO Inc."
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:ring-primary/20 text-white font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="companyWebsite" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Primary Domain</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="betterseohq.com"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:ring-primary/20 text-white font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="companyIndustry" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Market Industry</Label>
                  <Input
                    id="companyIndustry"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    placeholder="e.g., Marketing Technology"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:ring-primary/20 text-white font-medium"
                  />
                </div>
                <Button type="submit" disabled={saving} className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                  {saving ? 'Syncing...' : 'Update Context'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in duration-500">
          <Card className="glass border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02] p-8">
              <CardTitle className="text-xl font-bold">Security Protocols</CardTitle>
              <CardDescription className="text-gray-400 font-medium">Protect your betterSEO intelligence from unauthorized access.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                <div className="space-y-3">
                  <Label htmlFor="currentPassword" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Existing Cipher</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary text-white font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="newPassword" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">New Cipher</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary text-white font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Confirm Cipher</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary text-white font-medium"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                  {saving ? 'Encrypting...' : 'Update Cipher'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}