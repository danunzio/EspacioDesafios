'use client'

import { useRouter } from 'next/navigation'
import { StatsCard } from '@/components/admin/stats-card'
import { Card } from '@/components/ui/card'
import {
  Users,
  Baby,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
  CheckCircle,
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

export interface RecentActivity {
  id: string
  kind?: 'sesion' | 'pago'
  session_count?: number
  total_amount?: number
  payment_type?: 'efectivo' | 'transferencia'
  children?: { full_name: string } | null
  profiles?: { full_name: string } | null
  created_at: string
}

interface AdminDashboardClientProps {
  profile: Profile
  stats: {
    totalProfessionals: number
    totalActiveChildren: number
    currentModule: ModuleValue | null
    pendingLiquidations: number
    pendingPayments: number
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

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatsCard
          title="Total Profesionales"
          value={stats.totalProfessionals}
          subtitle="Activos"
          icon={Users}
          color="purple"
          onClick={() => router.push('/admin/profesionales')}
        />
        <StatsCard
          title="Pacientes Activos"
          value={stats.totalActiveChildren}
          subtitle="En tratamiento"
          icon={Baby}
          color="pink"
          onClick={() => router.push('/admin/ninos')}
        />
        <StatsCard
          title="Pagos por verificar"
          value={stats.pendingPayments}
          subtitle="Por revisar"
          icon={Wallet}
          color="purple"
          onClick={() => router.push('/admin/pagos')}
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
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[#E8E5F0] last:border-0 gap-2 cursor-pointer hover:bg-[#F8F7FF]"
                onClick={() =>
                  activity.kind === 'pago'
                    ? router.push('/admin/pagos')
                    : router.push('/admin/liquidaciones')
                }
              >
                <div className="flex-1">
                  {activity.kind === 'pago' ? (
                    <>
                      <p className="font-medium text-[#2D2A32]">
                        {activity.profiles?.full_name || 'Profesional'}
                      </p>
                      <p className="text-sm text-[#6B6570]">
                        Registró un pago • {activity.payment_type === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-[#2D2A32]">
                        {activity.children?.full_name || 'Paciente'}
                      </p>
                      <p className="text-sm text-[#6B6570]">
                        {activity.profiles?.full_name || 'Profesional'} • {activity.session_count} sesiones
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-medium text-[#A38EC3]">
                    ${activity.total_amount?.toLocaleString('es-CL')}
                  </span>
                  <span className="text-[10px] text-[#9A94A0]">
                    {new Date(activity.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
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
