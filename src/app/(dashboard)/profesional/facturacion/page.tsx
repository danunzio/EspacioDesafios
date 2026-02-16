'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  Briefcase,
  Save,
  CheckCircle,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';
import { createPaymentToClinic, getPaymentsToClinic } from '@/lib/actions/payments';
import { useAuth } from '@/lib/hooks/use-auth';
import { getLiquidations } from '@/lib/actions/liquidations';

interface BillingData {
  id: string;
  year: number;
  month: number;
  total_sessions: number;
  total_amount: number;
  professional_percentage: number;
  professional_amount: number;
  clinic_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  module_breakdown: Array<{
    moduleName: string;
    sessionCount: number;
    rate: number;
    amount: number;
  }>;
}

interface PaymentData {
  id: string;
  payment_date: string;
  payment_type: 'efectivo' | 'transferencia';
  amount: number;
  notes?: string;
}

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
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingData[]>([]);
  
  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<'efectivo' | 'transferencia'>('transferencia');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  }, []);

  const currentBilling = useMemo(() => {
    return billingHistory.find(
      (b) => b.year === selectedYear && b.month === selectedMonth
    );
  }, [billingHistory, selectedYear, selectedMonth]);

  // Get last 6 months for historical view
  const historicalData = useMemo(() => {
    return billingHistory.slice(0, 6);
  }, [billingHistory]);

  const chartData = historicalData.map((h) => h.professional_amount);

  useEffect(() => {
    const loadBilling = async () => {
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        const result = await getLiquidations(undefined, undefined, user.id);
        if (result.success && result.data) {
          const mapped: BillingData[] = result.data.map((l) => ({
            id: l.id,
            year: l.year,
            month: l.month,
            total_sessions: l.total_sessions,
            total_amount: l.total_amount,
            professional_percentage: l.professional_percentage,
            professional_amount: l.professional_amount,
            clinic_amount: l.clinic_amount,
            status: l.status,
            module_breakdown: (l.module_breakdown || []) as BillingData['module_breakdown'],
          }));

          mapped.sort((a, b) => {
            if (a.year === b.year) {
              return b.month - a.month;
            }
            return b.year - a.year;
          });

          setBillingHistory(mapped);
        }
      } catch (error) {
        console.error('Error al cargar facturación del profesional:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBilling();
  }, [user]);

  // Load payments for current month
  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      const result = await getPaymentsToClinic(selectedYear, selectedMonth);
      if (result.success && result.data) {
        setPayments(result.data);
      }
      setLoading(false);
    };
    loadPayments();
  }, [selectedYear, selectedMonth]);

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

  const handleSavePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    if (!user) return;

    setSaving(true);
    const result = await createPaymentToClinic({
      professional_id: user.id,
      year: selectedYear,
      month: selectedMonth,
      payment_date: paymentDate,
      payment_type: paymentType,
      amount: parseFloat(paymentAmount),
      notes: paymentNotes || '',
    });

    if (result.success) {
      setSuccess(true);
      setShowPaymentForm(false);
      setPaymentAmount('');
      setPaymentNotes('');
      // Reload payments
      const paymentsResult = await getPaymentsToClinic(selectedYear, selectedMonth);
      if (paymentsResult.success && paymentsResult.data) {
        setPayments(paymentsResult.data);
      }
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(result.error || 'Error al guardar el pago');
    }
    setSaving(false);
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = currentBilling ? currentBilling.clinic_amount - totalPaid : 0;

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
        <>
          {/* Resumen por Tipo de Módulo */}
          <Card className="bg-gradient-to-br from-[#A38EC3]/5 to-[#F4C2C2]/5">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="text-[#A38EC3]" size={24} />
              <h3 className="text-lg font-semibold text-[#2D2A32]">
                Resumen por Tipo de Módulo - {MONTH_NAMES[currentBilling.month - 1]} {currentBilling.year}
              </h3>
            </div>

            <div className="space-y-3">
              {currentBilling.module_breakdown.map((module, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#2D2A32]">{module.moduleName}</h4>
                    <Badge variant="default">{module.sessionCount} sesiones</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[#6B6570]">Valor</p>
                      <p className="font-medium text-[#2D2A32]">{formatCurrency(module.rate)}</p>
                    </div>
                    <div>
                      <p className="text-[#6B6570]">Facturado</p>
                      <p className="font-medium text-[#2D2A32]">{formatCurrency(module.amount)}</p>
                    </div>
                    <div>
                      <p className="text-[#6B6570]">Comisión ({currentBilling.professional_percentage}%)</p>
                      <p className="font-medium text-[#E8A5A5]">
                        {formatCurrency(module.amount * (currentBilling.professional_percentage / 100))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6B6570]">Neto</p>
                      <p className="font-medium text-[#A38EC3]">
                        {formatCurrency(module.amount * (1 - currentBilling.professional_percentage / 100))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#E8E5F0]">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-[#A38EC3]" size={16} />
                    <span className="text-sm font-medium text-[#6B6570]">
                      Total Sesiones
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
                      Facturación Total
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#2D2A32]">
                    {formatCurrency(currentBilling.total_amount)}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="text-[#F4C2C2]" size={16} />
                    <span className="text-sm font-medium text-[#6B6570]">
                      Comisión Total
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#E8A5A5]">
                    {formatCurrency(currentBilling.clinic_amount)}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="text-[#A8E6CF]" size={16} />
                    <span className="text-sm font-medium text-[#6B6570]">
                      Tu Pago
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#2D2A32]">
                    {formatCurrency(currentBilling.professional_amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Badge variant={currentBilling.status === 'paid' ? 'success' : currentBilling.status === 'approved' ? 'warning' : 'default'}>
                {currentBilling.status === 'paid'
                  ? 'Pagado'
                  : currentBilling.status === 'approved'
                  ? 'Aprobado'
                  : 'Pendiente'}
              </Badge>
              {currentBilling.status === 'paid' && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle size={16} />
                  Pago procesado
                </span>
              )}
            </div>
          </Card>

          {/* Pago a Espacio Desafíos */}
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="text-[#A38EC3]" size={24} />
              <h3 className="text-lg font-semibold text-[#2D2A32]">
                Pago a Espacio Desafíos
              </h3>
            </div>

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl flex items-center gap-2">
                <CheckCircle size={20} />
                <span className="text-sm">Pago registrado correctamente. El administrador ha sido notificado.</span>
              </div>
            )}

            {!showPaymentForm ? (
              <div className="space-y-4">
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-[#2D2A32]">Pagos realizados este mes</h4>
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-[#2D2A32]">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-[#6B6570]">
                            {new Date(payment.payment_date).toLocaleDateString('es-CL')} • {payment.payment_type === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                          </p>
                          {payment.notes && (
                            <p className="text-xs text-[#9A94A0] mt-1">{payment.notes}</p>
                          )}
                        </div>
                        <Badge variant="success">Registrado</Badge>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B6570]">Total pagado:</span>
                        <span className="font-medium text-[#2D2A32]">{formatCurrency(totalPaid)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-[#6B6570]">Pendiente:</span>
                        <span className="font-medium text-[#E8A5A5]">{formatCurrency(remainingAmount)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#6B6570]">
                    <Wallet size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No has registrado pagos este mes</p>
                    <p className="text-sm mt-1">
                      Comisión pendiente: {formatCurrency(currentBilling.clinic_amount)}
                    </p>
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full"
                >
                  <DollarSign size={18} className="mr-2" />
                  Registrar Nuevo Pago
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de pago
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de pago
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'efectivo' | 'transferencia')}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importe ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A94A0]">$</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  {remainingAmount > 0 && (
                    <p className="text-xs text-[#6B6570] mt-1">
                      Pendiente: {formatCurrency(remainingAmount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Número de transferencia, comprobante, etc."
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleSavePayment}
                    disabled={saving || !paymentAmount}
                    className="flex-1"
                  >
                    <Save size={18} className="mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Pago'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentForm(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="p-3 bg-[#F9E79F]/30 rounded-xl flex items-start gap-2">
                  <AlertCircle className="text-[#D4B850] flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-[#6B6570]">
                    Al guardar el pago, se enviará una notificación al administrador de Espacio Desafíos.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </>
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


    </div>
  );
}
