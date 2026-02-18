import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/navigation/header'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { InstallPrompt } from '@/components/ui/install-prompt'
import { Profile } from '@/types'

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  const userRole = profile.role as 'admin' | 'professional'
  const isAdmin = userRole === 'admin'

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      <Header title={isAdmin ? 'Panel Administracion' : 'Mi Dashboard'} isAdmin={isAdmin} />
      
      <main className="pb-16 sm:pb-20 pt-2 sm:pt-4 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <BottomNav userRole={userRole} />
      <InstallPrompt />
    </div>
  )
}
