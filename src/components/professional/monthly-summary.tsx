import { MonthlySession } from '@/types'
import { Card } from '@/components/ui/card'
import { calculateBilling, calculateCommission, formatCurrency } from '@/lib/utils/calculations'
import { TrendingUp, DollarSign, Percent, Users } from 'lucide-react'

interface MonthlySummaryProps {
  sessions: MonthlySession[]
  moduleValue: number
  childrenCount: number
}

export function MonthlySummary({
  sessions,
  moduleValue,
  childrenCount,
}: MonthlySummaryProps) {
  const totalSessions = sessions.reduce(
    (acc, session) => acc + session.session_count,
    0
  )

  const totalBilling = calculateBilling(totalSessions, moduleValue)
  const commission = calculateCommission(totalBilling, 0.25)
  const netAmount = totalBilling - commission

  const averageSessionsPerChild = childrenCount > 0
    ? (totalSessions / childrenCount).toFixed(1)
    : '0'

  return (
    <Card>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-[#A38EC3]" size={20} />
        <h3 className="text-lg font-semibold text-[#2D2A32]">
          Resumen del Mes
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#A38EC3]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-[#A38EC3]" size={16} />
            <span className="text-sm font-medium text-[#6B6570]">
              Facturación Total
            </span>
          </div>
          <p className="text-2xl font-bold text-[#2D2A32]">
            {formatCurrency(totalBilling)}
          </p>
          <p className="text-xs text-[#6B6570] mt-1">
            {totalSessions} sesiones cargadas
          </p>
        </div>

        <div className="bg-[#F4C2C2]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="text-[#E8A5A5]" size={16} />
            <span className="text-sm font-medium text-[#6B6570]">
              Comisión 25%
            </span>
          </div>
          <p className="text-2xl font-bold text-[#2D2A32]">
            {formatCurrency(commission)}
          </p>
          <p className="text-xs text-[#6B6570] mt-1">
            Retención clínica
          </p>
        </div>

        <div className="bg-[#A8E6CF]/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-[#8ED9B8]" size={16} />
            <span className="text-sm font-medium text-[#6B6570]">
              Tu Pago
            </span>
          </div>
          <p className="text-2xl font-bold text-[#2D2A32]">
            {formatCurrency(netAmount)}
          </p>
          <p className="text-xs text-[#6B6570] mt-1">
            75% de la facturación
          </p>
        </div>
      </div>

      {childrenCount > 0 && (
        <div className="mt-6 pt-4 border-t border-[#E8E5F0]">
          <div className="flex items-center gap-2 mb-3">
            <Users className="text-[#9A94A0]" size={16} />
            <span className="text-sm font-medium text-[#6B6570]">
              Promedio por Paciente
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-[#F8F7FF] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#A38EC3] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (parseFloat(averageSessionsPerChild) / 10) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium text-[#2D2A32]">
              {averageSessionsPerChild} sesiones
            </span>
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="mt-4 p-4 bg-[#F9E79F]/20 rounded-2xl text-center">
          <p className="text-sm text-[#6B6570]">
            No tienes sesiones cargadas este mes.{' '}
            <span className="font-medium text-[#A38EC3]">
              ¡Comienza a cargar tus sesiones!
            </span>
          </p>
        </div>
      )}
    </Card>
  )
}
