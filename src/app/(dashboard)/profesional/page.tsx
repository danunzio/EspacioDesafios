import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MonthlySummary } from '@/components/professional/monthly-summary'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Baby,
  Calendar,
  DollarSign,
  Percent,
  Plus,
  AlertCircle,
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

  const { data: assignedChildren } = await supabase
    .from('children')
    .select('*')
    .eq('assigned_professional_id', user.id)
    .eq('is_active', true)

  const childrenCount = assignedChildren?.length || 0

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A32]">
            ¡Hola, {profile.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-[#6B6570] mt-1">
            Resumen de tu actividad este mes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="soft" className="text-center">
          <Baby className="mx-auto mb-2 text-[#A38EC3]" size={24} />
          <p className="text-2xl font-bold text-[#2D2A32]">{childrenCount}</p>
          <p className="text-xs text-[#6B6570]">Mis Niños</p>
        </Card>
        <Card variant="soft" className="text-center">
          <Calendar className="mx-auto mb-2 text-[#F4C2C2]" size={24} />
          <p className="text-2xl font-bold text-[#2D2A32]">{totalSessions}</p>
          <p className="text-xs text-[#6B6570]">Sesiones</p>
        </Card>
        <Card variant="soft" className="text-center">
          <DollarSign className="mx-auto mb-2 text-[#A8E6CF]" size={24} />
          <p className="text-2xl font-bold text-[#2D2A32]">
            ${estimatedBilling.toLocaleString('es-CL')}
          </p>
          <p className="text-xs text-[#6B6570]">Facturación</p>
        </Card>
        <Card variant="soft" className="text-center">
          <Percent className="mx-auto mb-2 text-[#F9E79F]" size={24} />
          <p className="text-2xl font-bold text-[#2D2A32]">
            ${commission.toLocaleString('es-CL')}
          </p>
          <p className="text-xs text-[#6B6570]">Comisión 25%</p>
        </Card>
      </div>

      <MonthlySummary
        sessions={monthlySessions || []}
        moduleValue={moduleValue}
        childrenCount={childrenCount}
      />

      <Card className="bg-gradient-to-r from-[#A38EC3]/10 to-[#F4C2C2]/10">
        <h3 className="text-lg font-semibold text-[#2D2A32] mb-4">
          Acciones Rápidas
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" className="flex-1">
            <Plus size={18} className="mr-2" />
            Cargar Sesiones
          </Button>
          <Button variant="secondary" className="flex-1">
            <Baby size={18} className="mr-2" />
            Ver Mis Niños
          </Button>
        </div>
      </Card>

      {hasNoSessions && (
        <Card className="border-2 border-[#F4C2C2] bg-[#F4C2C2]/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-[#E8A5A5] flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-[#2D2A32]">
                No has cargado sesiones este mes
              </h4>
              <p className="text-sm text-[#6B6570] mt-1">
                Recuerda cargar las sesiones realizadas para mantener tu facturación actualizada.
              </p>
              <Button variant="primary" size="sm" className="mt-3">
                Cargar Sesiones Ahora
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
