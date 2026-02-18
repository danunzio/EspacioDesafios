import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Baby,
  Calendar,
  DollarSign,
  Percent,
  Plus,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

export default async function ProfessionalDashboardPage() {
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

  if (!profile || profile.role !== 'professional') {
    redirect('/admin')
  }

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const [directChildrenResult, relationChildrenResult] = await Promise.all([
    supabase
      .from('children')
      .select('id')
      .eq('assigned_professional_id', user.id)
      .eq('is_active', true),
    supabase
      .from('children_professionals')
      .select('child_id')
      .eq('professional_id', user.id)
  ])

  const directChildrenIds = directChildrenResult.data?.map(c => c.id) || []
  const relationChildrenIds = relationChildrenResult.data?.map(c => c.child_id) || []
  const allChildrenIds = [...new Set([...directChildrenIds, ...relationChildrenIds])]

  const childrenCount = allChildrenIds.length

  const { data: monthlySessions } = await supabase
    .from('monthly_sessions')
    .select('*')
    .eq('professional_id', user.id)
    .eq('month', currentMonth)
    .eq('year', currentYear)

  const totalSessions = monthlySessions?.reduce(
    (acc, session) => acc + session.session_count,
    0
  ) || 0

  const { data: currentModule } = await supabase
    .from('module_values')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const moduleValue = currentModule?.fee_value || 0
  const estimatedBilling = totalSessions * moduleValue
  const commission = estimatedBilling * 0.25

  const hasNoSessions = totalSessions === 0

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2D2A32]">
          ¡Hola, {profile.full_name?.split(' ')[0]}!
        </h2>
        <p className="text-sm text-[#6B6570] mt-1">
          Resumen de tu actividad este mes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="soft" className="text-center p-4">
          <Baby className="mx-auto mb-2 text-[#A38EC3]" size={24} />
          <p className="text-xl sm:text-2xl font-bold text-[#2D2A32]">{childrenCount}</p>
          <p className="text-xs text-[#6B6570]">Mis Pacientes</p>
        </Card>
        <Card variant="soft" className="text-center p-4">
          <Calendar className="mx-auto mb-2 text-[#F4C2C2]" size={24} />
          <p className="text-xl sm:text-2xl font-bold text-[#2D2A32]">{totalSessions}</p>
          <p className="text-xs text-[#6B6570]">Sesiones</p>
        </Card>
        <Card variant="soft" className="text-center p-4">
          <DollarSign className="mx-auto mb-2 text-[#A8E6CF]" size={24} />
          <p className="text-xl sm:text-2xl font-bold text-[#2D2A32]">
            ${estimatedBilling.toLocaleString('es-CL')}
          </p>
          <p className="text-xs text-[#6B6570]">Facturación</p>
        </Card>
        <Card variant="soft" className="text-center p-4">
          <Percent className="mx-auto mb-2 text-[#F9E79F]" size={24} />
          <p className="text-xl sm:text-2xl font-bold text-[#2D2A32]">
            ${commission.toLocaleString('es-CL')}
          </p>
          <p className="text-xs text-[#6B6570]">Comisión 25%</p>
        </Card>
      </div>

      {/* CTA Principal */}
      <Card className="bg-gradient-to-r from-[#A38EC3] to-[#B8A5D3] text-white">
        <div className="text-center py-2">
          <h3 className="text-lg font-semibold mb-2">
            ¡Comienza a cargar tus sesiones!
          </h3>
          <p className="text-sm text-white/80 mb-4">
            Registra las sesiones realizadas este mes para mantener tu facturación actualizada
          </p>
          <Link href="/profesional/sesiones">
            <Button
              variant="secondary"
              className="bg-white text-[#A38EC3] hover:bg-white/90 w-full sm:w-auto"
            >
              <Plus size={18} className="mr-2" />
              Cargar Sesiones
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </Card>





      {hasNoSessions && (
        <Card className="border-2 border-[#F4C2C2] bg-[#F4C2C2]/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertCircle className="text-[#E8A5A5] flex-shrink-0 mt-0.5 sm:mt-0" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-[#2D2A32]">
                No has cargado sesiones este mes
              </h4>
              <p className="text-sm text-[#6B6570] mt-1">
                Recuerda cargar las sesiones realizadas para mantener tu facturación actualizada.
              </p>
            </div>
            <Link href="/profesional/sesiones" className="w-full sm:w-auto mt-2 sm:mt-0">
              <Button variant="primary" size="sm" className="w-full">
                Cargar Sesiones Ahora
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
