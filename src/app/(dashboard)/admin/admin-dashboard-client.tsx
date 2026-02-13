'use client'

import { useState, useCallback } from 'react'
import { StatsCard } from '@/components/admin/stats-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AddChildModal } from '@/components/modals/add-child-modal'
import { AddProfessionalModal } from '@/components/modals/add-professional-modal'
import {
  Users,
  Baby,
  DollarSign,
  FileText,
  Plus,
  UserPlus,
  Settings,
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
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false)
  const [isAddProfessionalModalOpen, setIsAddProfessionalModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleChildSuccess = useCallback(() => {
    // Trigger a refresh of the dashboard data
    setRefreshKey((prev) => prev + 1)
    // In a real app, you might want to refresh the stats here
    // or use a state management solution like React Query
    window.location.reload()
  }, [])

  const handleProfessionalSuccess = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
    window.location.reload()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in" key={refreshKey}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A32]">
            ¡Hola, {profile.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-[#6B6570] mt-1">
            Bienvenido al panel de administración
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Profesionales"
          value={stats.totalProfessionals}
          subtitle="Activos"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Niños Activos"
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

      <Card variant="soft" className="bg-gradient-to-r from-[#A38EC3]/10 to-[#F4C2C2]/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Acciones Rápidas
            </h3>
            <p className="text-sm text-[#6B6570]">
              Gestiona tu clínica de forma eficiente
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setIsAddChildModalOpen(true)}
            >
              <Plus size={16} className="mr-1" />
              Nuevo Niño
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setIsAddProfessionalModalOpen(true)}
            >
              <UserPlus size={16} className="mr-1" />
              Nuevo Profesional
            </Button>
            <Button variant="outline" size="sm">
              <Settings size={16} className="mr-1" />
              Configuración
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
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
                className="flex items-center justify-between py-3 border-b border-[#E8E5F0] last:border-0"
              >
                <div>
                  <p className="font-medium text-[#2D2A32]">
                    {activity.children?.full_name || 'Niño'}
                  </p>
                  <p className="text-sm text-[#6B6570]">
                    {activity.profiles?.full_name || 'Profesional'} • {activity.session_count} sesiones
                  </p>
                </div>
                <span className="text-sm font-medium text-[#A38EC3]">
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

      {/* Modals */}
      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        onSuccess={handleChildSuccess}
      />

      <AddProfessionalModal
        isOpen={isAddProfessionalModalOpen}
        onClose={() => setIsAddProfessionalModalOpen(false)}
        onSuccess={handleProfessionalSuccess}
      />
    </div>
  )
}
