'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';

interface Professional {
  id: string;
  full_name: string;
}

interface LiquidationData {
  professional_id: string;
  professional_name: string;
  total_sessions: number;
  module_value: number;
  total_billed: number;
  commission_25: number;
  is_paid: boolean;
  payment_date?: string;
}

// Mock data - replace with actual data fetching
const mockProfessionals: Professional[] = [
  { id: 'prof1', full_name: 'Ana López' },
  { id: 'prof2', full_name: 'Pedro Rojas' },
  { id: 'prof3', full_name: 'Carmen Díaz' },
];

const mockSessions = {
  prof1: [
    { child_id: '1', session_count: 8 },
    { child_id: '2', session_count: 6 },
  ],
  prof2: [
    { child_id: '3', session_count: 10 },
    { child_id: '4', session_count: 4 },
  ],
  prof3: [
    { child_id: '5', session_count: 7 },
  ],
};

const mockModuleValue = 45000;

export default function AdminLiquidationsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [liquidations, setLiquidations] = useState<LiquidationData[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  const calculateLiquidations = () => {
    const results: LiquidationData[] = [];

    const professionalsToProcess =
      selectedProfessional === 'all'
        ? mockProfessionals
        : mockProfessionals.filter((p) => p.id === selectedProfessional);

    professionalsToProcess.forEach((prof) => {
      const sessions = mockSessions[prof.id as keyof typeof mockSessions] || [];
      const totalSessions = sessions.reduce(
        (acc, s) => acc + s.session_count,
        0
      );
      const totalBilled = totalSessions * mockModuleValue;
      const commission = totalBilled * 0.25;

      results.push({
        professional_id: prof.id,
        professional_name: prof.full_name,
        total_sessions: totalSessions,
        module_value: mockModuleValue,
        total_billed: totalBilled,
        commission_25: commission,
        is_paid: false,
      });
    });

    setLiquidations(results);
    setIsCalculated(true);
  };

  const handleMarkAsPaid = (professionalId: string) => {
    setLiquidations((prev) =>
      prev.map((liq) =>
        liq.professional_id === professionalId
          ? {
              ...liq,
              is_paid: true,
              payment_date: new Date().toISOString(),
            }
          : liq
      )
    );
  };

  const totalSessions = liquidations.reduce((acc, l) => acc + l.total_sessions, 0);
  const totalBilled = liquidations.reduce((acc, l) => acc + l.total_billed, 0);
  const totalCommission = liquidations.reduce((acc, l) => acc + l.commission_25, 0);
  const totalNet = totalBilled - totalCommission;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Liquidaciones</h2>
        <p className="text-[#6B6570] mt-1">
          Calcula y gestiona las liquidaciones mensuales
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="text-[#A38EC3]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Calcular Liquidación
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <select
              value={year}
              onChange={(e) => {
                setYear(parseInt(e.target.value));
                setIsCalculated(false);
              }}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes
            </label>
            <select
              value={month}
              onChange={(e) => {
                setMonth(parseInt(e.target.value));
                setIsCalculated(false);
              }}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => {
                setSelectedProfessional(e.target.value);
                setIsCalculated(false);
              }}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              <option value="all">Todos los profesionales</option>
              {mockProfessionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={calculateLiquidations}
          className="w-full sm:w-auto"
        >
          <Calculator size={18} className="mr-2" />
          Calcular Liquidación
        </Button>
      </Card>

      {isCalculated && liquidations.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="soft" className="text-center">
              <Users className="mx-auto mb-2 text-[#A38EC3]" size={24} />
              <p className="text-2xl font-bold text-[#2D2A32]">{totalSessions}</p>
              <p className="text-xs text-[#6B6570]">Total Sesiones</p>
            </Card>
            <Card variant="soft" className="text-center">
              <DollarSign className="mx-auto mb-2 text-[#A8E6CF]" size={24} />
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(totalBilled)}
              </p>
              <p className="text-xs text-[#6B6570]">Total Facturado</p>
            </Card>
            <Card variant="soft" className="text-center">
              <TrendingUp className="mx-auto mb-2 text-[#F9E79F]" size={24} />
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(totalCommission)}
              </p>
              <p className="text-xs text-[#6B6570]">Comisión 25%</p>
            </Card>
            <Card variant="soft" className="text-center">
              <FileText className="mx-auto mb-2 text-[#F4C2C2]" size={24} />
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(totalNet)}
              </p>
              <p className="text-xs text-[#6B6570]">Total a Pagar</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-[#2D2A32] mb-4">
              Resultados de Liquidación - {MONTH_NAMES[month - 1]} {year}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E5F0]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                      Profesional
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#6B6570]">
                      Sesiones
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                      Valor Módulo
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                      Total Facturado
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                      Comisión 25%
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#6B6570]">
                      Estado
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#6B6570]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {liquidations.map((liq) => (
                    <tr
                      key={liq.professional_id}
                      className="border-b border-[#E8E5F0] last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-[#2D2A32]">
                        {liq.professional_name}
                      </td>
                      <td className="py-3 px-4 text-center text-[#2D2A32]">
                        {liq.total_sessions}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6B6570]">
                        {formatCurrency(liq.module_value)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#2D2A32]">
                        {formatCurrency(liq.total_billed)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6B6570]">
                        {formatCurrency(liq.commission_25)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {liq.is_paid ? (
                          <Badge variant="success">
                            <CheckCircle size={14} className="mr-1" />
                            Pagado
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <AlertCircle size={14} className="mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!liq.is_paid && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarkAsPaid(liq.professional_id)}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Marcar Pagado
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {isCalculated && liquidations.length === 0 && (
        <Card className="text-center py-12">
          <AlertCircle className="mx-auto mb-4 text-[#9A94A0]" size={48} />
          <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
            No hay datos para liquidar
          </h3>
          <p className="text-[#6B6570]">
            No se encontraron sesiones cargadas para el período seleccionado
          </p>
        </Card>
      )}
    </div>
  );
}
