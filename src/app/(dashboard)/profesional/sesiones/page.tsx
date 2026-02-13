'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Save,
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';
import { SessionRow } from '@/components/professional/session-row';

interface Child {
  id: string;
  full_name: string;
}

interface SessionData {
  child_id: string;
  session_count: number;
  previous_month_count: number;
}

// Mock data - replace with actual data fetching
const mockMyChildren: Child[] = [
  { id: '1', full_name: 'Juan Pérez García' },
  { id: '2', full_name: 'Sofia Martínez' },
  { id: '3', full_name: 'Lucas Fernández' },
  { id: '4', full_name: 'Valentina Silva' },
];

const mockPreviousSessions: Record<string, number> = {
  '1': 8,
  '2': 6,
  '3': 10,
  '4': 4,
};

const mockModuleValue = 45000;

export default function ProfessionalSessionsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [sessions, setSessions] = useState<SessionData[]>(
    mockMyChildren.map((child) => ({
      child_id: child.id,
      session_count: 0,
      previous_month_count: mockPreviousSessions[child.id] || 0,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  }, []);

  const handleSessionChange = (childId: string, count: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.child_id === childId ? { ...s, session_count: count } : s
      )
    );
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const totalSessions = sessions.reduce((acc, s) => acc + s.session_count, 0);
  const estimatedBilling = totalSessions * mockModuleValue;
  const commission = estimatedBilling * 0.25;
  const netAmount = estimatedBilling - commission;

  const hasChanges = sessions.some((s) => s.session_count > 0);

  const getChildName = (childId: string) => {
    return mockMyChildren.find((c) => c.id === childId)?.full_name || 'Niño';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Cargar Sesiones</h2>
        <p className="text-[#6B6570] mt-1">
          Registra las sesiones realizadas este mes
        </p>
      </div>

      <Card variant="soft" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-[#A38EC3]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">Período</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
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
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="text-[#A38EC3]" size={24} />
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Mis Niños
            </h3>
          </div>
          <Badge variant="default">
            {mockMyChildren.length} niños asignados
          </Badge>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionRow
              key={session.child_id}
              childName={getChildName(session.child_id)}
              sessionCount={session.session_count}
              previousMonthCount={session.previous_month_count}
              onChange={(count) => handleSessionChange(session.child_id, count)}
            />
          ))}
        </div>

        {saveSuccess && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={20} />
            <span className="text-sm">Sesiones guardadas correctamente</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save size={18} className="mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Sesiones'}
          </Button>
        </div>
      </Card>

      {hasChanges && (
        <Card className="bg-gradient-to-r from-[#A38EC3]/10 to-[#F4C2C2]/10">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-[#A38EC3]" size={24} />
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Vista Previa de Facturación
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-[#A38EC3]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Total Sesiones
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">{totalSessions}</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-[#A38EC3]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Valor Módulo
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(mockModuleValue)}
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-[#A8E6CF]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Facturación
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(estimatedBilling)}
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-[#8ED9B8]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Tu Pago (75%)
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(netAmount)}
              </p>
              <p className="text-xs text-[#6B6570]">
                Comisión: {formatCurrency(commission)}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#F9E79F]/30 rounded-xl flex items-start gap-2">
            <AlertCircle className="text-[#D4B850] flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-[#6B6570]">
              Estos valores son estimados. El cálculo final dependerá de la
              liquidación realizada por administración.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
