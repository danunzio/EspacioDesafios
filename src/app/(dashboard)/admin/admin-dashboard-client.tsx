'use client'

import { useRouter } from 'next/navigation'
import { StatsCard } from '@/components/admin/stats-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Users,
  Baby,
  DollarSign,
  FileText,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
}

interface ModuleValue {
  fee_value: number
}

interface RecentActivity {
  id: string
  session_count: number
  total_amount: number
  children?: { full_name: string } | null
  profiles?: { full_name: string } | null
}

interface AdminDashboardClientProps {
  profile: Profile
  stats: {
    totalProfessionals: number
    totalActiveChildren: number
    currentModule: ModuleValue | null
    pendingLiquidations: number
  }
  recentActivity: RecentActivity[] | null
}

export function AdminDashboardClient({
  profile,
  stats,
  recentActivity,
}: AdminDashboardClientProps) {
  const router = useRouter()

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2D2A32]">
          ¡Hola, {profile.full_name?.split(' ')[0]}!
        </h2>
        <p className="text-sm text-[#6B6570] mt-1">
          Bienvenido al panel de administración
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total Profesionales"
          value={stats.totalProfessionals}
          subtitle="Activos"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Pacientes Activos"
          value={stats.totalActiveChildren}
          subtitle="En tratamiento"
          icon={Baby}
          color="pink"
        />
        <StatsCard
          title="Valor Módulo"
          value={`$${stats.currentModule?.fee_value?.toLocaleString('es-CL') || '0'}`}
          subtitle="Mes actual"
          icon={DollarSign}
          color="aqua"
        />
        <StatsCard
          title="Liquidaciones"
          value={stats.pendingLiquidations}
          subtitle="Pendientes"
          icon={FileText}
          color="yellow"
        />
      </div>

      {/* Acción Rápida - Agregar Gasto */}
      <Card 
        variant="soft" 
        className="bg-gradient-to-r from-[#E8A5A5]/10 to-[#F4C2C2]/10 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => router.push('/admin/consumos')}
      >
        <div className="flex items-center gap-4 p-2">
          <div className="w-12 h-12 rounded-full bg-[#E8A5A5]/20 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="text-[#E8A5A5]" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Agregar gasto
            </h3>
            <p className="text-sm text-[#6B6570]">
              Registra un nuevo gasto operativo
            </p>
          </div>
          <Button variant="primary" size="sm" className="flex-shrink-0">
            <Plus size={18} className="mr-2" />
            Agregar
          </Button>
        </div>
      </Card>

      {/* Actividad Reciente */}
      <Card>
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
          <TrendingUp className="text-[#A38EC3]" size={20} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Actividad Reciente
          </h3>
        </div>
        
        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[#E8E5F0] last:border-0 gap-2"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#2D2A32]">
                    {activity.children?.full_name || 'Paciente'}
                  </p>
                  <p className="text-sm text-[#6B6570]">
                    {activity.profiles?.full_name || 'Profesional'} • {activity.session_count} sesiones
                  </p>
                </div>
                <span className="text-sm font-medium text-[#A38EC3] text-right">
                  ${activity.total_amount?.toLocaleString('es-CL')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6B6570] text-center py-8">
            No hay actividad reciente
          </p>
        )}
      </Card>
    </div>
  )
}
