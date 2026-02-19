'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Droplets,
  Flame,
  Sparkles,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  DollarSign,
  Calendar,
  Home,
  Building2
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type Expense
} from '@/lib/actions/values';

const EXPENSE_CATEGORIES = [
  'Alquiler',
  'Luz',
  'Aysa',
  'Agua',
  'Limpieza',
  'Imp Municipal',
  'Otros'
] as const;

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

const categoryIcons: Record<string, typeof Zap> = {
  'Alquiler': Home,
  'Luz': Zap,
  'Aysa': Droplets,
  'Agua': Droplets,
  'Limpieza': Sparkles,
  'Imp Municipal': Building2,
  'Otros': MoreHorizontal,
};

const categoryColors: Record<string, string> = {
  'Alquiler': '#A38EC3',
  'Luz': '#F9E79F',
  'Aysa': '#A8E6CF',
  'Agua': '#AED6F1',
  'Limpieza': '#8ED9B8',
  'Imp Municipal': '#D4B850',
  'Otros': '#9A94A0',
};

export default function AdminConsumosPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formMonth, setFormMonth] = useState(new Date().getMonth() + 1);
  const [formCategory, setFormCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formRegisteredBy, setFormRegisteredBy] = useState('Cintia');

  // Load expenses
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    const result = await getExpenses(
      selectedYear,
      selectedMonth || undefined
    );
    if (result.success && result.data) {
      setExpenses(result.data);
    }
    setLoading(false);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return grouped;
  }, [filteredExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numericAmount = parseFloat(formAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    setLoading(true);

    const expenseData = {
      year: formYear,
      month: formMonth,
      category: formCategory,
      description: formDescription.trim() || '',
      amount: numericAmount,
      registered_by: formRegisteredBy
    };

    if (editingId) {
      const result = await updateExpense(editingId, expenseData);
      if (result.success) {
        await loadExpenses();
        handleCancel();
        setSuccess('Gasto actualizado correctamente');
      } else {
        setError(result.error || 'Error al actualizar el gasto');
      }
    } else {
      const result = await createExpense(expenseData);
      if (result.success) {
        await loadExpenses();
        handleCancel();
        setSuccess('Gasto registrado correctamente');
      } else {
        setError(result.error || 'Error al registrar el gasto');
      }
    }

    setLoading(false);
  };

  const handleEdit = (expense: Expense) => {
    setFormYear(expense.year);
    setFormMonth(expense.month);
    setFormCategory(expense.category as ExpenseCategory);
    setFormDescription(expense.description || '');
    setFormAmount(expense.amount.toString());
    setFormRegisteredBy(expense.registered_by || 'Cintia');
    setEditingId(expense.id);
    setIsFormOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return;
    }

    setLoading(true);
    const result = await deleteExpense(id);

    if (result.success) {
      await loadExpenses();
      setSuccess('Gasto eliminado correctamente');
    } else {
      setError(result.error || 'Error al eliminar el gasto');
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormYear(new Date().getFullYear());
    setFormMonth(new Date().getMonth() + 1);
    setFormCategory(EXPENSE_CATEGORIES[0]);
    setFormDescription('');
    setFormAmount('');
    setFormRegisteredBy('Cintia');
    setError(null);
    setSuccess(null);
  };

  const openNewExpenseForm = () => {
    setEditingId(null);
    setFormYear(selectedYear);
    setFormMonth(selectedMonth || new Date().getMonth() + 1);
    setFormCategory(EXPENSE_CATEGORIES[0]);
    setFormDescription('');
    setFormAmount('');
    setFormRegisteredBy('Cintia');
    setError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || MoreHorizontal;
    return Icon;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Panel de Gastos</h2>
        <p className="text-[#6B6570] mt-1">
          Registro y seguimiento de gastos operativos
        </p>
      </div>

      {/* Filters */}
      <Card variant="soft" className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-[#A38EC3]" />
            <span className="font-medium text-[#2D2A32]">Filtros:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              <option value="">Todo el año</option>
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
          {!isFormOpen && (
            <Button onClick={openNewExpenseForm} variant="primary" size="sm">
              <Plus size={16} className="mr-1" />
              Nuevo Gasto
            </Button>
          )}
        </div>
      </Card>

      {/* Total Summary */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center justify-center sm:justify-start gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-red-600 font-medium">Total Gastos</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-red-500">
                {selectedMonth
                  ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
                  : `Año ${selectedYear}`
                }
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right w-full">
            <p className="text-sm text-[#6B6570]">{filteredExpenses.length} registros</p>
          </div>
        </div>
      </Card>

      {/* Form */}
      {isFormOpen && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              {editingId ? 'Editar' : 'Nuevo'} Gasto
            </h3>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-[#6B6570]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registrado por
                </label>
                <select
                  value={formRegisteredBy}
                  onChange={(e) => setFormRegisteredBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white font-medium text-[#2D2A32]"
                  disabled={loading}
                  required
                >
                  <option value="Cintia">Cintia</option>
                  <option value="Daniela">Daniela</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <select
                  value={formYear}
                  onChange={(e) => setFormYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
                  disabled={loading}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes
                </label>
                <select
                  value={formMonth}
                  onChange={(e) => setFormMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
                  disabled={loading}
                >
                  {MONTH_NAMES.map((name, index) => (
                    <option key={index + 1} value={index + 1}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
                  disabled={loading}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A94A0]">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="15000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
                    min="0.01"
                    step="0.01"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <input
                type="text"
                placeholder="Detalle del gasto..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
                disabled={loading}
              />
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
                disabled={!formAmount || loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Guardando...
                  </span>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {editingId ? 'Actualizar' : 'Guardar'}
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

      {/* Expenses by Category */}
      {Object.keys(expensesByCategory).length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-[#2D2A32] mb-4">
            Desglose por Categoría
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => {
              const Icon = getCategoryIcon(category);
              const color = categoryColors[category] || '#9A94A0';
              return (
                <div
                  key={category}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${color}30` }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-sm font-medium text-[#6B6570]">
                      {category}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#2D2A32]">
                    {formatCurrency(amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Expenses Table */}
      <Card>
        <h3 className="text-lg font-semibold text-[#2D2A32] mb-4">
          Registro de Gastos
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E5F0]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Carga
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Período
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Categoría
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Responsable
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Descripción
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Monto
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-[#6B6570]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6B6570]">
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Cargando...
                    </span>
                  </td>
                </tr>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const Icon = getCategoryIcon(expense.category);
                  const color = categoryColors[expense.category] || '#9A94A0';

                  return (
                    <tr
                      key={expense.id}
                      className="border-b border-[#E8E5F0] last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-[#6B6570] text-sm">
                        {new Date(expense.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-[#2D2A32]">
                        {MONTH_NAMES[expense.month - 1]} {expense.year}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${color}30` }}
                          >
                            <Icon size={14} style={{ color }} />
                          </div>
                          <span className="text-[#2D2A32]">{expense.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default" className={
                          expense.registered_by === 'Cintia'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }>
                          {expense.registered_by || '—'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#6B6570]">
                        {expense.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#2D2A32]">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#6B6570]">
                    No hay gastos registrados para el período seleccionado
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
