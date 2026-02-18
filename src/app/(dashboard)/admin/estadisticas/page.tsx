'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Wallet
} from 'lucide-react';

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
import { formatCurrency } from '@/lib/utils/calculations';
import { MONTH_NAMES } from '@/types';
import {
  getMonthlyStats,
  getProfessionalStats,
  getDashboardStats,
  getValueTypesDistribution,
  getFinancialHealth,
  getPaymentStatusDistribution,
  getProfessionalsWithoutPayments
} from '@/lib/actions/statistics';

export default function EstadisticasPage() {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; facturacion: number; sesiones: number; profesionales: number }>>([]);
  const [professionalData, setProfessionalData] = useState<Array<{ name: string; sesiones: number; facturacion: number }>>([]);
  const [valueTypesData, setValueTypesData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [financialData, setFinancialData] = useState<Array<{ month: string; income: number; expenses: number }>>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [unpaidProfessionalsData, setUnpaidProfessionalsData] = useState<Array<{ id: string; full_name: string; email: string }>>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFacturacion: 0,
    totalSesiones: 0,
    promedioSesiones: 0,
    profesionalesActivos: 0
  });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  // Load all statistics
  const loadStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load monthly stats
      const monthlyResult = await getMonthlyStats(selectedYear);
      if (monthlyResult.success && monthlyResult.data) {
        const formatted = monthlyResult.data.map(stat => ({
          month: MONTH_NAMES[stat.month - 1].substring(0, 3),
          facturacion: stat.totalAmount,
          sesiones: stat.totalSessions,
          profesionales: stat.professionalCount
        }));
        setMonthlyData(formatted);
      }

      // Load professional stats
      const profResult = await getProfessionalStats(selectedYear, selectedMonth || undefined);
      if (profResult.success && profResult.data) {
        const formatted = profResult.data.map(stat => ({
          name: stat.professionalName,
          sesiones: stat.totalSessions,
          facturacion: stat.totalAmount
        }));
        setProfessionalData(formatted);
      }

      // Load value types distribution
      const valueResult = await getValueTypesDistribution();
      if (valueResult.success && valueResult.data) {
        setValueTypesData(valueResult.data);
      }

      // Load dashboard stats
      const dashResult = await getDashboardStats();
      if (dashResult.success && dashResult.data) {
        setDashboardStats({
          totalFacturacion: dashResult.data.currentMonthAmount,
          totalSesiones: dashResult.data.currentMonthSessions,
          promedioSesiones: dashResult.data.currentMonthSessions > 0
            ? Math.round(dashResult.data.currentMonthSessions / (selectedMonth || 12))
            : 0,
          profesionalesActivos: dashResult.data.activeProfessionals
        });
      }

      // Load financial health
      const financialResult = await getFinancialHealth(selectedYear);
      if (financialResult.success && financialResult.data) {
        const formatted = financialResult.data.map(item => ({
          month: MONTH_NAMES[item.month - 1].substring(0, 3),
          income: item.income,
          expenses: item.expenses
        }));
        setFinancialData(formatted);
      }

      // Load payment status distribution
      const statusResult = await getPaymentStatusDistribution();
      if (statusResult.success && statusResult.data) {
        setPaymentStatusData(statusResult.data);
      }

      // Load professionals without payments
      const targetMonthForUnpaid = selectedMonth || (new Date().getMonth() + 1);
      const unpaidResult = await getProfessionalsWithoutPayments(selectedYear, targetMonthForUnpaid);
      if (unpaidResult.success && unpaidResult.data) {
        setUnpaidProfessionalsData(unpaidResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    }

    setLoading(false);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Calculate totals for display
  const displayStats = useMemo(() => {
    const filteredData = selectedMonth
      ? monthlyData.filter(d => d.month === MONTH_NAMES[selectedMonth - 1].substring(0, 3))
      : monthlyData;

    const totalFacturacion = filteredData.reduce((acc, curr) => acc + curr.facturacion, 0);
    const totalSesiones = filteredData.reduce((acc, curr) => acc + curr.sesiones, 0);
    const promedioSesiones = filteredData.length > 0
      ? Math.round(totalSesiones / filteredData.length)
      : 0;

    return {
      totalFacturacion,
      totalSesiones,
      promedioSesiones,
      profesionalesActivos: dashboardStats.profesionalesActivos
    };
  }, [monthlyData, selectedMonth, dashboardStats.profesionalesActivos]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A32]">Estadísticas</h2>
          <p className="text-[#6B6570] mt-1">
            Reportes visuales de ingresos, gastos y volumen de sesiones
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadStatistics}
            disabled={loading}
          >
            <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download size={18} className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card variant="soft" className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#A38EC3]" />
            <span className="font-medium text-[#2D2A32]">Filtros:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
              disabled={loading}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
              disabled={loading}
            >
              <option value="">Todo el año</option>
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#A38EC3]/15 flex items-center justify-center">
              <DollarSign className="text-[#A38EC3]" size={24} />
            </div>
            <div>
              <p className="text-sm text-[#6B6570]">
                {selectedMonth ? 'Facturación del Mes' : 'Facturación Total'}
              </p>
              <p className="text-xl font-bold text-[#2D2A32]">
                {formatCurrency(displayStats.totalFacturacion)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#A8E6CF]/15 flex items-center justify-center">
              <Calendar className="text-[#8ED9B8]" size={24} />
            </div>
            <div>
              <p className="text-sm text-[#6B6570]">
                {selectedMonth ? 'Sesiones del Mes' : 'Total Sesiones'}
              </p>
              <p className="text-xl font-bold text-[#2D2A32]">{displayStats.totalSesiones}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F4C2C2]/15 flex items-center justify-center">
              <TrendingUp className="text-[#E8A5A5]" size={24} />
            </div>
            <div>
              <p className="text-sm text-[#6B6570]">Promedio Mensual</p>
              <p className="text-xl font-bold text-[#2D2A32]">{displayStats.promedioSesiones} ses.</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F9E79F]/15 flex items-center justify-center">
              <Users className="text-[#D4B850]" size={24} />
            </div>
            <div>
              <p className="text-sm text-[#6B6570]">Profesionales Activos</p>
              <p className="text-xl font-bold text-[#2D2A32]">{displayStats.profesionalesActivos}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Salud Financiera: Ingresos vs Gastos */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-[#8ED9B8]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Salud Financiera: Ingresos vs Gastos {selectedYear}
          </h3>
        </div>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#6B6570]">
              <RefreshCw size={24} className="animate-spin mr-2" />
              Cargando datos financieros...
            </div>
          ) : financialData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F0" />
                <XAxis dataKey="month" stroke="#6B6570" />
                <YAxis stroke="#6B6570" tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar name="Ingresos (Pagos recibidos)" dataKey="income" fill="#8ED9B8" radius={[8, 8, 0, 0]} />
                <Bar name="Gastos Operativos" dataKey="expenses" fill="#F4C2C2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[#6B6570]">
              No hay datos financieros para el período seleccionado
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Tipo de Valor */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="text-[#A38EC3]" size={24} />
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Distribución por Tipo de Valor
            </h3>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full text-[#6B6570]">
                <RefreshCw size={24} className="animate-spin mr-2" />
                Cargando...
              </div>
            ) : valueTypesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={valueTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {valueTypesData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#6B6570]">
                No hay datos de valores configurados
              </div>
            )}
          </div>
        </Card>

        {/* Verificación de Pagos */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="text-[#A38EC3]" size={24} />
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Estado de Pagos Recibidos
            </h3>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full text-[#6B6570]">
                <RefreshCw size={24} className="animate-spin mr-2" />
                Cargando...
              </div>
            ) : paymentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value || 0} pagos`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#6B6570]">
                No hay pagos registrados
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Profesionales sin registro de pagos */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="text-[#E8A5A5]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Profesionales sin registro de pagos
            <span className="text-sm font-normal text-[#6B6570] ml-2">
              ({selectedMonth ? MONTH_NAMES[selectedMonth - 1] : MONTH_NAMES[new Date().getMonth()]})
            </span>
          </h3>
        </div>
        <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[#6B6570]">
              <RefreshCw size={24} className="animate-spin mr-2" />
              Cargando...
            </div>
          ) : unpaidProfessionalsData.length > 0 ? (
            <div className="space-y-3">
              {unpaidProfessionalsData.map((prof) => (
                <div
                  key={prof.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#A38EC3]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center text-[#A38EC3] font-bold">
                      {prof.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D2A32]">{prof.full_name}</p>
                      <p className="text-xs text-[#6B6570]">{prof.email}</p>
                    </div>
                  </div>
                  <Badge variant="error" className="bg-red-50 text-red-600 border-red-200">
                    Sin registros
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-[#6B6570] text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Wallet className="text-green-500" size={32} />
              </div>
              <p className="font-medium text-[#2D2A32]">¡Todo al día!</p>
              <p className="text-sm">Todos los profesionales activos han registrado pagos este periodo.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
