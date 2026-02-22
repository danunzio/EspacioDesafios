'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkeletonList, SkeletonStatCard } from '@/components/ui/skeleton';
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
import { getLiquidations, calculateLiquidation } from '@/lib/actions/liquidations';

const VALUE_TYPE_LABELS: Record<string, string> = {
  nomenclatura: 'Nomenclador',
  modulos: 'Módulos',
  osde: 'OSDE',
  sesion: 'Sesión Individual'
};

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
    commissionPercentage?: number;
    professionalAmount?: number;
  }>;
}

interface PaymentData {
  id: string;
  payment_date: string;
  payment_type: 'efectivo' | 'transferencia';
  amount: number;
  notes?: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
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
  const { user, loading: authLoading } = useAuth();
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
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

  // Load payments and optional estimation
  useEffect(() => {
    const loadMonthlyContext = async () => {
      if (!user) return;
      setLoading(true);

      // Load actual payments
      const result = await getPaymentsToClinic(selectedYear, selectedMonth);
      if (result.success && result.data) {
        setPayments(result.data);
      }

      // If no official billing exists for this month, get an estimate
      const hasOfficial = billingHistory.some(b => b.year === selectedYear && b.month === selectedMonth);
      if (!hasOfficial) {
        const estResult = await calculateLiquidation(user.id, selectedYear, selectedMonth);
        if (estResult.success && estResult.data && estResult.data.totalSessions > 0) {
          const estimate: BillingData = {
            id: 'estimate',
            year: estResult.data.year,
            month: estResult.data.month,
            total_sessions: estResult.data.totalSessions,
            total_amount: estResult.data.totalAmount,
            professional_percentage: estResult.data.professionalPercentage,
            professional_amount: estResult.data.professionalAmount,
            clinic_amount: estResult.data.clinicAmount,
            status: 'pending',
            module_breakdown: estResult.data.moduleBreakdown.map(mb => ({
              moduleName: mb.moduleName,
              sessionCount: mb.sessionCount,
              rate: mb.rate,
              amount: mb.amount
            }))
          };
          // Don't modify billingHistory, just use a local state for estimate if needed?
          // Actually let's add it to a temporary display state
          setEstimate(estimate);
        } else {
          setEstimate(null);
        }
      } else {
        setEstimate(null);
      }
      setLoading(false);
    };
    loadMonthlyContext();
  }, [selectedYear, selectedMonth, user, billingHistory]);

  const [estimate, setEstimate] = useState<BillingData | null>(null);

  const displayBilling = useMemo(() => {
    return currentBilling || estimate;
  }, [currentBilling, estimate]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
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
  const remainingAmount = displayBilling ? displayBilling.clinic_amount - totalPaid : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {authLoading ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <SkeletonList count={4} />
          </div>
        </>
      ) : (
        <>
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

          {estimate && !currentBilling && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl flex items-start gap-2 border border-blue-100">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-sm">Vista Previa Estimada</p>
                <p className="text-xs">Esta es una estimación basada en tus sesiones guardadas. La liquidación oficial será generada por administración.</p>
              </div>
            </div>
          )}

          {displayBilling ? (
            <>
              {/* Resumen por Tipo de Módulo */}
              <Card className="bg-gradient-to-br from-[#A38EC3]/5 to-[#F4C2C2]/5">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="text-[#A38EC3]" size={24} />
                  <h3 className="text-lg font-semibold text-[#2D2A32]">
                    Resumen por Tipo de Módulo - {MONTH_NAMES[displayBilling.month - 1]} {displayBilling.year}
                  </h3>
                </div>

                <div className="space-y-3">
                  {displayBilling.module_breakdown.map((module) => (
                    <div
                      key={`${module.moduleName}-${module.sessionCount}`}
                      className="bg-white rounded-2xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#2D2A32]">{VALUE_TYPE_LABELS[module.moduleName] || module.moduleName}</h4>
                        <Badge variant="default">{module.sessionCount} sesiones</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-[#6B6570]">Valor</p>
                          <p className="font-medium text-[#2D2A32]">{formatCurrency(module.rate)}</p>
                        </div>
                        <div>
                          <p className="text-[#6B6570]">Facturado</p>
                          <p className="font-medium text-[#2D2A32]">{formatCurrency(module.amount)}</p>
                        </div>
                        <div>
                          <p className="text-[#6B6570]">Comisión ({module.commissionPercentage || displayBilling.professional_percentage}%)</p>
                          <p className="font-medium text-[#E8A5A5]">
                            {formatCurrency(module.professionalAmount || module.amount * ((module.commissionPercentage || displayBilling.professional_percentage) / 100))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[#E8E5F0]">
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-[#A38EC3]" size={16} />
                        <span className="text-sm font-medium text-[#6B6570]">
                          Total Sesiones
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-[#2D2A32] text-center">
                        {displayBilling.total_sessions}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-[#A38EC3]" size={16} />
                        <span className="text-sm font-medium text-[#6B6570]">
                          Facturación Total
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-[#2D2A32] text-center">
                        {formatCurrency(displayBilling.total_amount)}
                      </p>
                    </div>

                    <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="text-[#F4C2C2]" size={16} />
                        <span className="text-sm font-medium text-[#6B6570] text-center">
                          Comisión Total a abonar a Espacio Desafios
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-[#E8A5A5] text-center">
                        {formatCurrency(displayBilling.clinic_amount)}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge variant={displayBilling.status === 'paid' ? 'success' : displayBilling.status === 'approved' ? 'warning' : 'default'}>
                    {displayBilling.status === 'paid'
                      ? 'Pagado'
                      : displayBilling.status === 'approved'
                        ? 'Aprobado'
                        : displayBilling.id === 'estimate'
                          ? 'Borrador (Sesiones)'
                          : 'Pendiente'}
                  </Badge>
                  {displayBilling.status === 'paid' && (
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

                <div className="space-y-6">
                  {payments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-[#2D2A32]">Pagos realizados este mes</h4>
                      <div className="space-y-2">
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
                                <p className="text-xs text-[#78716C] mt-1">{payment.notes}</p>
                              )}
                            </div>
                            <Badge variant={
                              payment.verification_status === 'approved'
                                ? 'success'
                                : payment.verification_status === 'rejected'
                                  ? 'error'
                                  : 'warning'
                            }>
                              {payment.verification_status === 'approved'
                                ? 'Verificado'
                                : payment.verification_status === 'rejected'
                                  ? 'Rechazado'
                                  : 'Pendiente'}
                            </Badge>
                          </div>
                        ))}
                      </div>
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
                  )}

                  {!showPaymentForm ? (
                    <div className="space-y-4">
                      {payments.length === 0 && (
                        <div className="text-center py-6 text-[#6B6570]">
                          <Wallet size={48} className="mx-auto mb-3 opacity-50" />
                          <p>No has registrado pagos este mes</p>
                          <p className="text-sm mt-1">
                            Comisión Total a abonar a Espacio Desafios: {formatCurrency(displayBilling?.clinic_amount || 0)}
                          </p>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        onClick={() => setShowPaymentForm(true)}
                        className="w-full"
                      > Informar Pago
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-gray-100 bg-gray-50/50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-[#2D2A32]">Registrar Nuevo Pago</h4>
                        <button
                          onClick={() => setShowPaymentForm(false)}
                          className="text-xs text-[#6B6570] hover:text-[#A38EC3] transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de pago
                          </label>
                          <input
                            id="payment-date"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="payment-type" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de pago
                          </label>
                          <select
                            id="payment-type"
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value as 'efectivo' | 'transferencia')}
                            className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
                          >
                            <option value="transferencia">Transferencia</option>
                            <option value="efectivo">Efectivo</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 mb-1">
                          Importe ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]">$</span>
                          <input
                            id="payment-amount"
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
                            Monto restante por cubrir: {formatCurrency(remainingAmount)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="payment-notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Notas (opcional)
                        </label>
                        <textarea
                          id="payment-notes"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          placeholder="Número de transferencia, comprobante, etc."
                          className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none resize-none"
                          rows={2}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="primary"
                          onClick={handleSavePayment}
                          disabled={saving || !paymentAmount}
                          className="w-full"
                        >
                          <Save size={18} className="mr-2" />
                          {saving ? 'Guardando...' : 'Informar pago Pago'}
                        </Button>
                      </div>

                      <div className="mt-2 p-3 bg-[#F9E79F]/30 rounded-xl flex items-start gap-2">
                        <AlertCircle className="text-[#D4B850] flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-[#6B6570]">
                          Este pago se sumará a los anteriores de este período.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-[#78716C]" size={48} />
              <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
                Sin datos de facturación
              </h3>
              <p className="text-[#6B6570]">
                No hay registros de facturación para el período seleccionado
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
