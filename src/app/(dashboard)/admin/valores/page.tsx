'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useConfirm } from '@/components/ui/confirm-modal';
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
  Pencil,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';
import {
  getAllValueHistories,
  createOrUpdateValue,
  deleteValue,
  type ValueHistory
} from '@/lib/actions/values';

type ValueType = 'nomenclatura' | 'modulos' | 'osde' | 'sesion';

const valueTypeLabels: Record<ValueType, { label: string; icon: typeof FileText; color: string; description: string }> = {
  nomenclatura: {
    label: 'Nomenclador',
    icon: FileText,
    color: '#A38EC3',
    description: 'Valor de nomenclador para facturación'
  },
  modulos: {
    label: 'Módulos',
    icon: Briefcase,
    color: '#F4C2C2',
    description: 'Valor base por módulo de trabajo'
  },
  osde: {
    label: 'OSDE',
    icon: Heart,
    color: '#A8E6CF',
    description: 'Valor para pacientes con OSDE'
  },
  sesion: {
    label: 'Sesión Individual',
    icon: Clock,
    color: '#F9E79F',
    description: 'Valor por sesión individual'
  },
};

export default function AdminValuesPage() {
  const confirm = useConfirm();
  const [values, setValues] = useState<ValueHistory[]>([]);
  const [selectedType, setSelectedType] = useState<ValueType>('nomenclatura');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load values from database
  const loadValues = useCallback(async () => {
    setLoading(true);
    const result = await getAllValueHistories();
    if (result.success && result.data) {
      setValues(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadValues();
  }, [loadValues]);

  const currentValue = useMemo(() => {
    return values.find(
      (v) => v.value_type === selectedType && v.year === year && v.month === month
    );
  }, [values, selectedType, year, month]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setError('Ingresa un valor válido mayor a 0');
      return;
    }

    setLoading(true);

    const result = await createOrUpdateValue({
      value_type: selectedType,
      year,
      month,
      value: numericValue
    });

    if (result.success) {
      await loadValues();
      setValue('');
      setIsFormOpen(false);
      setEditingId(null);
      const action = currentValue ? 'actualizado' : 'configurado';
      setSuccess(`Valor de ${valueTypeLabels[selectedType].label} ${action} correctamente para ${MONTH_NAMES[month - 1]} ${year}`);
    } else {
      setError(result.error || 'Error al guardar el valor');
    }

    setLoading(false);
  };

  const handleEdit = (v: ValueHistory) => {
    setSelectedType(v.value_type as ValueType);
    setYear(v.year);
    setMonth(v.month);
    setValue(v.value.toString());
    setEditingId(v.id);
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Eliminar valor',
      message: '¿Estás seguro de que deseas eliminar este valor? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      icon: 'trash',
    });

    if (!confirmed) return;

    setLoading(true);
    const result = await deleteValue(id);

    if (result.success) {
      await loadValues();
      setSuccess('Valor eliminado correctamente');
    } else {
      setError(result.error || 'Error al eliminar el valor');
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setValue('');
    setError(null);
    setSuccess(null);
  };

  const openNewValueForm = () => {
    setEditingId(null);
    setValue('');
    setError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
  }, []);

  const getValuesByType = (type: ValueType) => {
    return values.filter((v) => v.value_type === type).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  const TypeIcon = valueTypeLabels[selectedType].icon;
  const typeColor = valueTypeLabels[selectedType].color;

  const isCurrentMonth = (v: ValueHistory) => {
    const now = new Date();
    return v.year === now.getFullYear() && v.month === now.getMonth() + 1;
  };

  const isFutureMonth = (v: ValueHistory) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return v.year > currentYear || (v.year === currentYear && v.month > currentMonth);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Configuración de Valores</h2>
        <p className="text-[#6B6570] mt-1">
          Administra los diferentes tipos de valores para la facturación (históricos y futuros)
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
                  setIsFormOpen(false);
                  setEditingId(null);
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

      {/* Add New Value Button */}
      {!isFormOpen && (
        <Button onClick={openNewValueForm} variant="primary" className="w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          Agregar/Editar Valor
        </Button>
      )}

      {/* Form for adding/editing values */}
      {isFormOpen && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TypeIcon style={{ color: typeColor }} size={24} />
              <h3 className="text-lg font-semibold text-[#2D2A32]">
                {editingId ? 'Editar' : 'Configurar'} {valueTypeLabels[selectedType].label}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-[#6B6570]" />
            </button>
          </div>

          {currentValue && !editingId && (
            <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: `${typeColor}20` }}>
              <p className="text-sm text-[#6B6570]">Valor actual configurado:</p>
              <p className="text-2xl font-bold" style={{ color: typeColor }}>
                {formatCurrency(currentValue.value)}
              </p>
              <p className="text-sm text-[#6B6570]">
                para {MONTH_NAMES[currentValue.month - 1]} {currentValue.year}
              </p>
              <p className="text-xs text-[#78716C] mt-2">
                Al guardar, se actualizará este valor
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <select
                  id="year-select"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
                  disabled={loading}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Mes
                </label>
                <select
                  id="month-select"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
                  disabled={loading}
                >
                  {MONTH_NAMES.map((name, index) => (
                    <option key={index + 1} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="value-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]">
                    $
                  </span>
                  <input
                    id="value-input"
                    type="number"
                    placeholder="45000"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
                    min="1"
                    step="0.01"
                    disabled={loading}
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

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={!value || loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Guardando...
                  </span>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {editingId ? 'Actualizar' : 'Guardar'} Valor
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* History Table */}
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
                  Última actualización
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Estado
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-4">
                    <SkeletonTable rows={4} cols={5} />
                  </td>
                </tr>
              ) : getValuesByType(selectedType).length > 0 ? (
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
                      {new Date(v.updated_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-4">
                      {isCurrentMonth(v) ? (
                        <Badge variant="success">Actual</Badge>
                      ) : isFutureMonth(v) ? (
                        <Badge variant="warning">Futuro</Badge>
                      ) : (
                        <Badge variant="default">Histórico</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(v)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Editar"
                          aria-label="Editar valor"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Eliminar"
                          aria-label="Eliminar valor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
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
              (v) => v.value_type === type &&
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
