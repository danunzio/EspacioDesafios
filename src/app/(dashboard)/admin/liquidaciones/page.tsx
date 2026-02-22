'use client';

import { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
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
  RefreshCw,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';
import {
  calculateLiquidation,
  createOrUpdateLiquidation,
  markLiquidationAsPaid,
  approveLiquidation,
  getLiquidations,
  type Liquidation
} from '@/lib/actions/liquidations';
import { getProfessionals, type Professional } from '@/lib/actions/professionals';
import { getAllPaymentsToClinic, type PaymentToClinic } from '@/lib/actions/payments';

interface CalculationResult {
  professionalId: string;
  professionalName: string;
  totalSessions: number;
  totalAmount: number;
  moduleBreakdown: Array<{
    moduleName: string;
    sessionCount: number;
    rate: number;
    amount: number;
  }>;
}

export default function AdminLiquidationsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);
  const [existingLiquidations, setExistingLiquidations] = useState<Liquidation[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentToClinic[]>([]);

  // Load professionals
  const loadProfessionals = useCallback(async () => {
    const result = await getProfessionals(true); // Include inactive
    if (result.success && result.data) {
      setProfessionals(result.data);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfessionals();
  }, [loadProfessionals]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
  }, []);

  const calculateLiquidations = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setIsCalculated(false);
    setCalculations([]);

    try {
      const professionalsToProcess =
        selectedProfessional === 'all'
          ? professionals.filter(p => p.is_active)
          : professionals.filter((p) => p.id === selectedProfessional);

      if (professionalsToProcess.length === 0) {
        setError('No hay profesionales seleccionados para calcular');
        setLoading(false);
        return;
      }

      const results: CalculationResult[] = [];

      for (const prof of professionalsToProcess) {
        const result = await calculateLiquidation(prof.id, year, month);

        if (result.success && result.data) {
          results.push({
            professionalId: prof.id,
            professionalName: prof.full_name,
            totalSessions: result.data.totalSessions,
            totalAmount: result.data.totalAmount,
            moduleBreakdown: result.data.moduleBreakdown
          });

          // Create or update liquidation in database
          await createOrUpdateLiquidation(prof.id, year, month);
        }
      }

      // Reload liquidations from database
      const liqResult = await getLiquidations(year, month, selectedProfessional === 'all' ? undefined : selectedProfessional);
      if (liqResult.success && liqResult.data) {
        setExistingLiquidations(liqResult.data);
      }

      const payResult = await getAllPaymentsToClinic(year, month);
      if (payResult.success && payResult.data) {
        setPayments(payResult.data as PaymentToClinic[]);
      }

      setCalculations(results);
      setIsCalculated(true);

      if (results.length > 0) {
        setSuccess(`Se calcularon ${results.length} liquidaciones correctamente`);
      } else {
        setSuccess('No se encontraron sesiones para el período seleccionado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular liquidaciones');
    }

    setLoading(false);
  };

  const handleMarkAsPaid = async (liquidationId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await markLiquidationAsPaid(liquidationId);

    if (result.success) {
      // Reload liquidations
      const liqResult = await getLiquidations(year, month, selectedProfessional === 'all' ? undefined : selectedProfessional);
      if (liqResult.success && liqResult.data) {
        setExistingLiquidations(liqResult.data);
      }
      setSuccess('Liquidación marcada como pagada');
    } else {
      setError(result.error || 'Error al marcar como pagada');
    }

    setLoading(false);
  };

  const handleApprove = async (liquidationId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await approveLiquidation(liquidationId);

    if (result.success) {
      // Reload liquidations
      const liqResult = await getLiquidations(year, month, selectedProfessional === 'all' ? undefined : selectedProfessional);
      if (liqResult.success && liqResult.data) {
        setExistingLiquidations(liqResult.data);
      }
      setSuccess('Liquidación aprobada correctamente');
    } else {
      setError(result.error || 'Error al aprobar la liquidación');
    }

    setLoading(false);
  };

  const getLiquidationForProfessional = (professionalId: string): Liquidation | undefined => {
    return existingLiquidations.find(l => l.professional_id === professionalId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="success">
            <CheckCircle size={14} className="mr-1" />
            Pagado
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="warning">
            <CheckCircle size={14} className="mr-1" />
            Aprobado
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="error">
            <AlertCircle size={14} className="mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="warning">
            <AlertCircle size={14} className="mr-1" />
            Pendiente
          </Badge>
        );
    }
  };

  const totalSessions = calculations.reduce((acc, c) => acc + c.totalSessions, 0);
  const totalAmount = calculations.reduce((acc, c) => acc + c.totalAmount, 0);
  const totalCommission = totalAmount * 0.25; // 25% commission
  const totalVerifiedPayments = payments.filter(p => p.verification_status === 'approved').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Liquidaciones</h2>
        <p className="text-[#6B6570] mt-1">
          Calcula y gestiona las liquidaciones mensuales de profesionales
        </p>
      </div>

      {/* Filters */}
      <Card variant="soft" className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#A38EC3]" />
            <span className="font-medium text-[#2D2A32]">Filtros:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
            <select
              value={year}
              onChange={(e) => {
                setYear(parseInt(e.target.value));
                setIsCalculated(false);
              }}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => {
                setMonth(parseInt(e.target.value));
                setIsCalculated(false);
              }}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
            <select
              value={selectedProfessional}
              onChange={(e) => {
                setSelectedProfessional(e.target.value);
                setIsCalculated(false);
              }}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              <option value="all">Todos los profesionales</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.full_name} {!prof.is_active && '(Inactivo)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Calculate Button */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Calcular Liquidación
            </h3>
          </div>
          <Button
            variant="primary"
            onClick={calculateLiquidations}
            disabled={loading || professionals.length === 0}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={18} className="animate-spin" />
                Calculando...
              </span>
            ) : (
              <>
                
                Calcular
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={20} />
            <span className="text-sm">{success}</span>
          </div>
        )}
      </Card>

      {/* Results Summary */}
      {isCalculated && calculations.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="soft" className="text-center">
            <Users className="mx-auto mb-2 text-[#A38EC3]" size={24} />
            <p className="text-2xl font-bold text-[#2D2A32]">{totalSessions}</p>
            <p className="text-xs text-[#6B6570]">Total Sesiones</p>
          </Card>
          <Card variant="soft" className="text-center">
            <DollarSign className="mx-auto mb-2 text-[#A8E6CF]" size={24} />
            <p className="text-2xl font-bold text-[#2D2A32]">
              {formatCurrency(totalAmount)}
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
              {formatCurrency(totalCommission)}
            </p>
            <p className="text-xs text-[#6B6570]">A Abonar a Espacio Desafíos</p>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {isCalculated && calculations.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Resultados de Liquidación - {MONTH_NAMES[month - 1]} {year}
            </h3>
          </div>

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
                    Total Facturado
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                    Comisión 25%
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                    A Pagar (Pendiente)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                    Pagos Verificados
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
                {calculations.map((calc) => {
                  const liquidation = getLiquidationForProfessional(calc.professionalId);
                  const commission = calc.totalAmount * 0.25;
                  const verifiedForProf = payments
                    .filter(p => p.professional_id === calc.professionalId && p.verification_status === 'approved')
                    .reduce((sum, p) => sum + (p.amount || 0), 0);
                  const pendingForProf = Math.max(commission - verifiedForProf, 0);
                  const isExpanded = showDetails === calc.professionalId;

                  return (
                    <Fragment key={calc.professionalId}>
                      <tr
                        className="border-b border-[#E8E5F0] last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium text-[#2D2A32]">
                          {calc.professionalName}
                        </td>
                        <td className="py-3 px-4 text-center text-[#2D2A32]">
                          {calc.totalSessions}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-[#2D2A32]">
                          {formatCurrency(calc.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right text-[#6B6570]">
                          {formatCurrency(commission)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#2D2A32]">
                          {formatCurrency(pendingForProf)}
                        </td>
                        <td className="py-3 px-4 text-right text-[#2D2A32]">
                          {formatCurrency(verifiedForProf)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {liquidation ? getStatusBadge(liquidation.status) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setShowDetails(isExpanded ? null : calc.professionalId)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors text-sm"
                            >
                              {isExpanded ? 'Ocultar' : 'Detalle'}
                            </button>
                            {liquidation && liquidation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(liquidation.id)}
                                  disabled={loading}
                                  className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                  title="Aprobar"
                                  aria-label="Aprobar liquidación"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              </>
                            )}
                            {liquidation && liquidation.status === 'approved' && (
                              <button
                                onClick={() => handleMarkAsPaid(liquidation.id)}
                                disabled={loading}
                                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                title="Marcar como pagado"
                                aria-label="Marcar liquidación como pagada"
                              >
                                <DollarSign size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="py-4 px-4 bg-gray-50">
                            <div className="text-sm">
                              <h4 className="font-semibold text-[#2D2A32] mb-2">
                                Desglose por Módulo
                              </h4>
                              {calc.moduleBreakdown.length > 0 ? (
                                <table className="w-full max-w-2xl">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 text-xs font-medium text-[#6B6570]">
                                        Módulo
                                      </th>
                                      <th className="text-center py-2 text-xs font-medium text-[#6B6570]">
                                        Sesiones
                                      </th>
                                      <th className="text-right py-2 text-xs font-medium text-[#6B6570]">
                                        Valor
                                      </th>
                                      <th className="text-right py-2 text-xs font-medium text-[#6B6570]">
                                        Total
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {calc.moduleBreakdown.map((module, idx) => (
                                      <tr key={idx} className="border-b border-gray-100 last:border-0">
                                        <td className="py-2 text-[#2D2A32]">{module.moduleName}</td>
                                        <td className="py-2 text-center text-[#2D2A32]">{module.sessionCount}</td>
                                        <td className="py-2 text-right text-[#6B6570]">{formatCurrency(module.rate)}</td>
                                        <td className="py-2 text-right font-medium text-[#2D2A32]">{formatCurrency(module.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-[#6B6570]">No hay desglose disponible</p>
                              )}
                              <div className="mt-4">
                                <h4 className="font-semibold text-[#2D2A32] mb-2">
                                  Pagos del Profesional
                                </h4>
                                {payments.filter(p => p.professional_id === calc.professionalId).length > 0 ? (
                                  <div className="space-y-2">
                                    {payments.filter(p => p.professional_id === calc.professionalId).map(p => (
                                      <div key={p.id} className="flex items-center justify-between p-2 bg-white rounded-xl">
                                        <div>
                                          <p className="font-medium text-[#2D2A32]">{formatCurrency(p.amount)}</p>
                                          <p className="text-xs text-[#6B6570]">
                                            {new Date(p.payment_date).toLocaleDateString('es-CL')} • {p.payment_type === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                                          </p>
                                          {p.notes && <p className="text-xs text-[#78716C] mt-1">{p.notes}</p>}
                                        </div>
                                        <Badge variant={
                                          p.verification_status === 'approved'
                                            ? 'success'
                                            : p.verification_status === 'rejected'
                                              ? 'error'
                                              : 'warning'
                                        }>
                                          {p.verification_status === 'approved'
                                            ? 'Verificado'
                                            : p.verification_status === 'rejected'
                                              ? 'Rechazado'
                                              : 'Pendiente'}
                                        </Badge>
                                      </div>
                                    ))}
                                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                                      <span className="text-[#6B6570]">Pendiente a abonar a Espacio Desafíos:</span>
                                      <span className="font-semibold text-[#2D2A32]">{formatCurrency(Math.max(commission - verifiedForProf, 0))}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[#6B6570]">Sin pagos cargados</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* No Data */}
      {isCalculated && calculations.length === 0 && (
        <Card className="text-center py-12">
          <Calendar className="mx-auto mb-4 text-[#78716C]" size={48} />
          <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
            No hay datos para liquidar
          </h3>
          <p className="text-[#6B6570]">
            No se encontraron sesiones cargadas para el período seleccionado
          </p>
        </Card>
      )}

      {/* Instructions */}
      <Card variant="soft" className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">
          ¿Cómo funciona?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Selecciona el año, mes y profesional (o todos)</li>
          <li>Haz clic en &quot;Calcular Liquidación&quot; para procesar</li>
          <li>El sistema calcula automáticamente basándose en las sesiones confirmadas</li>
          <li>Marca como pagadas una vez realizado el pago</li>
        </ul>
      </Card>
    </div>
  );
}
