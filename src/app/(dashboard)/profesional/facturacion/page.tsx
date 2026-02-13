'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Percent,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';

interface BillingData {
  year: number;
  month: number;
  total_sessions: number;
  module_value: number;
  total_billed: number;
  commission: number;
  net_amount: number;
  is_paid: boolean;
}

// Mock data - replace with actual data fetching
const mockBillingHistory: BillingData[] = [
  {
    year: 2026,
    month: 2,
    total_sessions: 45,
    module_value: 45000,
    total_billed: 2025000,
    commission: 506250,
    net_amount: 1518750,
    is_paid: false,
  },
  {
    year: 2026,
    month: 1,
    total_sessions: 42,
    module_value: 45000,
    total_billed: 1890000,
    commission: 472500,
    net_amount: 1417500,
    is_paid: true,
  },
  {
    year: 2025,
    month: 12,
    total_sessions: 38,
    module_value: 42000,
    total_billed: 1596000,
    commission: 399000,
    net_amount: 1197000,
    is_paid: true,
  },
  {
    year: 2025,
    month: 11,
    total_sessions: 40,
    module_value: 42000,
    total_billed: 1680000,
    commission: 420000,
    net_amount: 1260000,
    is_paid: true,
  },
  {
    year: 2025,
    month: 10,
    total_sessions: 35,
    module_value: 40000,
    total_billed: 1400000,
    commission: 350000,
    net_amount: 1050000,
    is_paid: true,
  },
  {
    year: 2025,
    month: 9,
    total_sessions: 36,
    module_value: 40000,
    total_billed: 1440000,
    commission: 360000,
    net_amount: 1080000,
    is_paid: true,
  },
];

// Simple bar chart component
function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((value, index) => {
        const height = ((value - min) / range) * 80 + 20;
        return (
          <div
            key={index}
            className="flex-1 bg-[#A38EC3] rounded-t hover:bg-[#8B73B3] transition-colors relative group"
            style={{ height: `${height}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2D2A32] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {formatCurrency(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfessionalBillingPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  }, []);

  const currentBilling = useMemo(() => {
    return mockBillingHistory.find(
      (b) => b.year === selectedYear && b.month === selectedMonth
    );
  }, [selectedYear, selectedMonth]);

  // Get last 6 months for historical view
  const historicalData = useMemo(() => {
    return mockBillingHistory.slice(0, 6);
  }, []);

  const chartData = historicalData.map((h) => h.net_amount);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Mi Facturación</h2>
        <p className="text-[#6B6570] mt-1">
          Consulta tu facturación y pagos
        </p>
      </div>

      <Card variant="soft" className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-[#6B6570]" />
          </button>

          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white text-sm"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ChevronRight size={24} className="text-[#6B6570]" />
          </button>
        </div>
      </Card>

      {currentBilling ? (
        <Card className="bg-gradient-to-br from-[#A38EC3]/5 to-[#F4C2C2]/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <DollarSign className="text-[#A38EC3]" size={24} />
              <h3 className="text-lg font-semibold text-[#2D2A32]">
                Resumen {MONTH_NAMES[currentBilling.month - 1]} {currentBilling.year}
              </h3>
            </div>
            <Badge variant={currentBilling.is_paid ? 'success' : 'warning'}>
              {currentBilling.is_paid ? 'Pagado' : 'Pendiente'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-[#A38EC3]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Sesiones
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {currentBilling.total_sessions}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-[#A38EC3]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Valor Módulo
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(currentBilling.module_value)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-[#A8E6CF]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Facturación
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(currentBilling.total_billed)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="text-[#8ED9B8]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Tu Pago (75%)
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(currentBilling.net_amount)}
              </p>
              <p className="text-xs text-[#6B6570]">
                Comisión 25%: {formatCurrency(currentBilling.commission)}
              </p>
            </div>
          </div>

          {currentBilling.is_paid && (
            <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm">
              ✅ Pago procesado correctamente
            </div>
          )}
        </Card>
      ) : (
        <Card className="text-center py-12">
          <Calendar className="mx-auto mb-4 text-[#9A94A0]" size={48} />
          <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
            Sin datos de facturación
          </h3>
          <p className="text-[#6B6570]">
            No hay registros de facturación para el período seleccionado
          </p>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-[#A38EC3]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Tendencia de Pagos (Últimos 6 meses)
          </h3>
        </div>

        {historicalData.length > 0 ? (
          <>
            <MiniBarChart data={chartData} />

            <div className="mt-6 space-y-3">
              {historicalData.map((billing) => (
                <div
                  key={`${billing.year}-${billing.month}`}
                  className="flex items-center justify-between py-3 border-b border-[#E8E5F0] last:border-0"
                >
                  <div>
                    <p className="font-medium text-[#2D2A32]">
                      {MONTH_NAMES[billing.month - 1]} {billing.year}
                    </p>
                    <p className="text-sm text-[#6B6570]">
                      {billing.total_sessions} sesiones
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#2D2A32]">
                      {formatCurrency(billing.net_amount)}
                    </p>
                    <Badge
                      variant={billing.is_paid ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {billing.is_paid ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-[#6B6570] py-8">
            No hay datos históricos disponibles
          </p>
        )}
      </Card>
    </div>
  );
}
