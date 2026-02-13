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
  FileText,
  Briefcase,
  Heart,
  Clock,
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';

type ValueType = 'nomenclatura' | 'modulos' | 'osde' | 'sesion';

interface ValueConfig {
  id: string;
  type: ValueType;
  year: number;
  month: number;
  value: number;
  created_at: string;
}

const valueTypeLabels: Record<ValueType, { label: string; icon: typeof FileText; color: string }> = {
  nomenclatura: { label: 'Nomenclatura', icon: FileText, color: '#A38EC3' },
  modulos: { label: 'Módulos', icon: Briefcase, color: '#F4C2C2' },
  osde: { label: 'OSDE', icon: Heart, color: '#A8E6CF' },
  sesion: { label: 'Sesión Individual', icon: Clock, color: '#F9E79F' },
};

// Mock data - replace with actual data fetching
const mockValues: ValueConfig[] = [
  { id: '1', type: 'nomenclatura', year: 2026, month: 2, value: 15000, created_at: '2026-02-01' },
  { id: '2', type: 'nomenclatura', year: 2026, month: 1, value: 14500, created_at: '2026-01-01' },
  { id: '3', type: 'modulos', year: 2026, month: 2, value: 45000, created_at: '2026-02-01' },
  { id: '4', type: 'modulos', year: 2026, month: 1, value: 45000, created_at: '2026-01-01' },
  { id: '5', type: 'modulos', year: 2025, month: 12, value: 42000, created_at: '2025-12-01' },
  { id: '6', type: 'osde', year: 2026, month: 2, value: 38000, created_at: '2026-02-01' },
  { id: '7', type: 'osde', year: 2026, month: 1, value: 37500, created_at: '2026-01-01' },
  { id: '8', type: 'sesion', year: 2026, month: 2, value: 25000, created_at: '2026-02-01' },
  { id: '9', type: 'sesion', year: 2026, month: 1, value: 24500, created_at: '2026-01-01' },
];

export default function AdminValuesPage() {
  const [values, setValues] = useState<ValueConfig[]>(mockValues);
  const [selectedType, setSelectedType] = useState<ValueType>('nomenclatura');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentValue = useMemo(() => {
    return values.find(
      (v) => v.type === selectedType && v.year === year && v.month === month
    );
  }, [values, selectedType, year, month]);

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
      setError(`Ya existe un valor configurado para ${valueTypeLabels[selectedType].label} en ${MONTH_NAMES[month - 1]} ${year}`);
      return;
    }

    const newValue: ValueConfig = {
      id: Date.now().toString(),
      type: selectedType,
      year,
      month,
      value: numericValue,
      created_at: new Date().toISOString(),
    };

    setValues((prev) => [newValue, ...prev]);
    setValue('');
    setSuccess(`Valor de ${valueTypeLabels[selectedType].label} configurado correctamente para ${MONTH_NAMES[month - 1]} ${year}`);
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  const getValuesByType = (type: ValueType) => {
    return values.filter((v) => v.type === type).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  const TypeIcon = valueTypeLabels[selectedType].icon;
  const typeColor = valueTypeLabels[selectedType].color;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Configuración de Valores</h2>
        <p className="text-[#6B6570] mt-1">
          Administra los diferentes tipos de valores para la facturación
        </p>
      </div>

      {/* Tabs for value types */}
      <Card variant="soft" className="p-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {(Object.keys(valueTypeLabels) as ValueType[]).map((type) => {
            const Icon = valueTypeLabels[type].icon;
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setValue('');
                  setError(null);
                  setSuccess(null);
                }}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-white shadow-md text-[#2D2A32] font-medium' 
                    : 'text-[#6B6570] hover:bg-white/50'
                  }
                `}
              >
                <Icon 
                  size={20} 
                  style={{ color: isActive ? valueTypeLabels[type].color : undefined }}
                />
                <span className="hidden sm:inline">{valueTypeLabels[type].label}</span>
                <span className="sm:hidden">{valueTypeLabels[type].label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-6">
          <TypeIcon style={{ color: typeColor }} size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">
            Configurar {valueTypeLabels[selectedType].label}
          </h3>
        </div>

        {currentValue && (
          <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: `${typeColor}20` }}>
            <p className="text-sm text-[#6B6570]">Valor actual configurado:</p>
            <p className="text-2xl font-bold" style={{ color: typeColor }}>
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
            Historial de {valueTypeLabels[selectedType].label}
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
              {getValuesByType(selectedType).length > 0 ? (
                getValuesByType(selectedType).map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-[#E8E5F0] last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-[#2D2A32]">
                      {MONTH_NAMES[v.month - 1]} {v.year}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#2D2A32]">
                      {formatCurrency(v.value)}
                    </td>
                    <td className="py-3 px-4 text-[#6B6570]">
                      {new Date(v.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-4">
                      {v.year === new Date().getFullYear() &&
                      v.month === new Date().getMonth() + 1 ? (
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
                    No hay valores configurados para {valueTypeLabels[selectedType].label}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-[#A38EC3]/5 to-[#F4C2C2]/5">
        <h3 className="text-lg font-semibold text-[#2D2A32] mb-4">
          Resumen de Valores Actuales - {MONTH_NAMES[new Date().getMonth()]} {new Date().getFullYear()}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(valueTypeLabels) as ValueType[]).map((type) => {
            const currentMonthValue = values.find(
              (v) => v.type === type && 
              v.year === new Date().getFullYear() && 
              v.month === new Date().getMonth() + 1
            );
            const Icon = valueTypeLabels[type].icon;
            return (
              <div 
                key={type} 
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: valueTypeLabels[type].color }} />
                  <span className="text-sm font-medium text-[#6B6570]">
                    {valueTypeLabels[type].label}
                  </span>
                </div>
                <p className="text-xl font-bold text-[#2D2A32]">
                  {currentMonthValue ? formatCurrency(currentMonthValue.value) : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
