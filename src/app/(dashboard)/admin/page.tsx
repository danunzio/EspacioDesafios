import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboardClient, type RecentActivity } from './admin-dashboard-client'

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
  
  const { count: pendingPayments } = await supabase
    .from('payments_to_clinic')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending')
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

  const sessionActivity: RecentActivity[] = (recentActivity || []).map((a): RecentActivity => ({
    id: a.id as string,
    kind: 'sesion',
    children: a.children as any,
    profiles: a.profiles as any,
    session_count: a.session_count as number,
    total_amount: a.total_amount as number,
    created_at: a.created_at as string,
  }))

  const paymentActivity: RecentActivity[] = (recentPayments || []).map((p): RecentActivity => ({
    id: p.id as string,
    kind: 'pago',
    children: null,
    profiles: p.profiles as any,
    session_count: 0,
    total_amount: p.amount as number,
    payment_type: p.payment_type as 'efectivo' | 'transferencia',
    created_at: p.payment_date as string,
  }))

  const combinedRecent: RecentActivity[] = [...sessionActivity, ...paymentActivity]

  const stats = {
    totalProfessionals: totalProfessionals || 0,
    totalActiveChildren: totalActiveChildren || 0,
    currentModule,
    pendingLiquidations: pendingLiquidations || 0,
    pendingPayments: pendingPayments || 0,
  }

  return (
    <AdminDashboardClient
      profile={profile}
      stats={stats}
      recentActivity={combinedRecent}
    />
  )
}
