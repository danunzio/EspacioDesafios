import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from './admin-dashboard-client'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/profesional')
  }

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const { count: totalProfessionals } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'professional')
    .eq('is_active', true)

  const { count: totalActiveChildren } = await supabase
    .from('children')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { data: currentModule } = await supabase
    .from('module_values')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { count: pendingLiquidations } = await supabase
    .from('liquidations')
    .select('*', { count: 'exact', head: true })
    .eq('is_paid', false)
    .eq('month', currentMonth)
    .eq('year', currentYear)

  const { data: recentActivity } = await supabase
    .from('monthly_sessions')
    .select(`
      *,
      children:child_id(full_name),
      profiles:professional_id(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentPayments } = await supabase
    .from('payments_to_clinic')
    .select(`
      *,
      profiles:professional_id(full_name)
    `)
    .order('payment_date', { ascending: false })
    .limit(5)

  const combinedRecent = [
    ...(recentActivity || []).map(a => ({
      id: a.id,
      kind: 'sesion',
      children: a.children,
      profiles: a.profiles,
      session_count: a.session_count,
      total_amount: a.total_amount
    })),
    ...(recentPayments || []).map(p => ({
      id: p.id,
      kind: 'pago',
      children: null,
      profiles: p.profiles,
      session_count: 0,
      total_amount: p.amount,
      payment_type: p.payment_type
    })),
  ]

  const stats = {
    totalProfessionals: totalProfessionals || 0,
    totalActiveChildren: totalActiveChildren || 0,
    currentModule,
    pendingLiquidations: pendingLiquidations || 0,
  }

  return (
    <AdminDashboardClient
      profile={profile}
      stats={stats}
      recentActivity={combinedRecent}
    />
  )
}
