'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/calculations';
import { MONTH_NAMES } from '@/types';
import { 
  getMonthlyStats, 
  getProfessionalStats, 
  getDashboardStats,
  getValueTypesDistribution
} from '@/lib/actions/statistics';

export default function EstadisticasPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [monthlyData, setMonthlyData] = useState<Array<{month: string; facturacion: number; sesiones: number; profesionales: number}>>([]);
  const [professionalData, setProfessionalData] = useState<Array<{name: string; sesiones: number; facturacion: number}>>([]);
  const [valueTypesData, setValueTypesData] = useState<Array<{name: string; value: number; color: string}>>([]);
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
            ? Math.round(dashResult.data.currentMonthSessions / (selectedMonth ? 1 : 12))
            : 0,
          profesionalesActivos: dashResult.data.activeProfessionals
        });
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A32]">Estadísticas</h2>
          <p className="text-[#6B6570] mt-1">
            Reportes visuales de facturación y volumen de sesiones
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
        <Card className="bg-red-50 border-red-200">
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

      {/* Gráfico de Facturación Mensual */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-[#A38EC3]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Facturación Mensual {selectedYear}
          </h3>
        </div>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#6B6570]">
              <RefreshCw size={24} className="animate-spin mr-2" />
              Cargando datos...
            </div>
          ) : monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedMonth ? monthlyData.filter(d => d.month === MONTH_NAMES[selectedMonth - 1].substring(0, 3)) : monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F0" />
                <XAxis dataKey="month" stroke="#6B6570" />
                <YAxis stroke="#6B6570" tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="facturacion" fill="#A38EC3" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[#6B6570]">
              No hay datos disponibles para el período seleccionado
            </div>
          )}
        </div>
      </Card>

      {/* Gráficos en Grid */}
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
                    {valueTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
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

        {/* Evolución de Sesiones */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-[#A38EC3]" size={24} />
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Evolución de Sesiones {selectedYear}
            </h3>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full text-[#6B6570]">
                <RefreshCw size={24} className="animate-spin mr-2" />
                Cargando...
              </div>
            ) : monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedMonth ? monthlyData.filter(d => d.month === MONTH_NAMES[selectedMonth - 1].substring(0, 3)) : monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F0" />
                  <XAxis dataKey="month" stroke="#6B6570" />
                  <YAxis stroke="#6B6570" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line 
                    type="monotone" 
                    dataKey="sesiones" 
                    stroke="#A38EC3" 
                    strokeWidth={3}
                    dot={{ fill: '#A38EC3', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#6B6570]">
                No hay datos disponibles
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Rendimiento por Profesional */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-[#A38EC3]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Rendimiento por Profesional {selectedYear}
            {selectedMonth && ` - ${MONTH_NAMES[selectedMonth - 1]}`}
          </h3>
        </div>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#6B6570]">
              <RefreshCw size={24} className="animate-spin mr-2" />
              Cargando...
            </div>
          ) : professionalData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={professionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F0" />
                <XAxis type="number" stroke="#6B6570" tickFormatter={(value) => `$${value / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#6B6570" width={150} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="facturacion" fill="#A38EC3" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[#6B6570]">
              No hay datos de profesionales para el período seleccionado
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
