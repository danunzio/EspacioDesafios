'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Save,
  History,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';

interface ModuleValueConfig {
  id: string;
  year: number;
  month: number;
  value: number;
  created_at: string;
}

// Mock data - replace with actual data fetching
const mockModuleValues: ModuleValueConfig[] = [
  { id: '1', year: 2026, month: 2, value: 45000, created_at: '2026-02-01' },
  { id: '2', year: 2026, month: 1, value: 45000, created_at: '2026-01-01' },
  { id: '3', year: 2025, month: 12, value: 42000, created_at: '2025-12-01' },
  { id: '4', year: 2025, month: 11, value: 42000, created_at: '2025-11-01' },
  { id: '5', year: 2025, month: 10, value: 40000, created_at: '2025-10-01' },
];

export default function AdminValuesPage() {
  const [moduleValues, setModuleValues] = useState<ModuleValueConfig[]>(mockModuleValues);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentValue = useMemo(() => {
    return moduleValues.find(
      (mv) => mv.year === year && mv.month === month
    );
  }, [moduleValues, year, month]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setError('Ingresa un valor válido mayor a 0');
      return;
    }

    if (currentValue) {
      setError(`Ya existe un valor configurado para ${MONTH_NAMES[month - 1]} ${year}`);
      return;
    }

    const newValue: ModuleValueConfig = {
      id: Date.now().toString(),
      year,
      month,
      value: numericValue,
      created_at: new Date().toISOString(),
    };

    setModuleValues((prev) => [newValue, ...prev]);
    setValue('');
    setSuccess(`Valor de módulo configurado correctamente para ${MONTH_NAMES[month - 1]} ${year}`);
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Configuración de Valores</h2>
        <p className="text-[#6B6570] mt-1">
          Administra los valores de módulo para la facturación
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="text-[#A38EC3]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Configurar Valor de Módulo
          </h3>
        </div>

        {currentValue && (
          <div className="mb-6 p-4 bg-[#A38EC3]/10 rounded-2xl">
            <p className="text-sm text-[#6B6570]">Valor actual configurado:</p>
            <p className="text-2xl font-bold text-[#A38EC3]">
              {formatCurrency(currentValue.value)}
            </p>
            <p className="text-sm text-[#6B6570]">
              para {MONTH_NAMES[currentValue.month - 1]} {currentValue.year}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A94A0]">
                  $
                </span>
                <input
                  type="number"
                  placeholder="45000"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
                  min="1"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle size={20} />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={!value || !!currentValue}
          >
            <Save size={18} className="mr-2" />
            Guardar Valor
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-6">
          <History className="text-[#A38EC3]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Historial de Valores
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E5F0]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Período
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Valor
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Fecha Configuración
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {moduleValues.length > 0 ? (
                moduleValues.map((mv) => (
                  <tr
                    key={mv.id}
                    className="border-b border-[#E8E5F0] last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-[#2D2A32]">
                      {MONTH_NAMES[mv.month - 1]} {mv.year}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#2D2A32]">
                      {formatCurrency(mv.value)}
                    </td>
                    <td className="py-3 px-4 text-[#6B6570]">
                      {new Date(mv.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-4">
                      {mv.year === new Date().getFullYear() &&
                      mv.month === new Date().getMonth() + 1 ? (
                        <Badge variant="success">Actual</Badge>
                      ) : (
                        <Badge variant="default">Histórico</Badge>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-[#6B6570]"
                  >
                    No hay valores configurados aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
