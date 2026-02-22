 'use client';
 
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonList } from '@/components/ui/skeleton';
import { MONTH_NAMES } from '@/types';
 import { formatCurrency } from '@/lib/utils/calculations';
 import { getAllPaymentsToClinic, reviewPaymentToClinic, type PaymentToClinic } from '@/lib/actions/payments';
 import { ChevronLeft, ChevronRight, Wallet, CheckCircle, XCircle } from 'lucide-react';
 
 export default function AdminPaymentsPage() {
   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
   const [payments, setPayments] = useState<(PaymentToClinic & { professional?: { full_name: string; email: string } })[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
 
   const years = useMemo(() => {
     const currentYear = new Date().getFullYear();
     return Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
   }, []);
 
   const loadPayments = async () => {
     setLoading(true);
     setError(null);
      const result = await getAllPaymentsToClinic(selectedYear, selectedMonth);
      if (result.success && result.data) {
        setPayments(result.data);
      } else {
       setError(result.error || 'Error al cargar pagos');
     }
     setLoading(false);
   };
 
   useEffect(() => {
     loadPayments();
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedYear, selectedMonth]);
 
   const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
 
   const handleReview = async (id: string, action: 'approved' | 'rejected') => {
     setError(null);
     setSuccess(null);
     const result = await reviewPaymentToClinic(id, action);
     if (result.success) {
       setSuccess(action === 'approved' ? 'Pago verificado correctamente.' : 'Pago rechazado correctamente.');
       await loadPayments();
       setTimeout(() => setSuccess(null), 3000);
     } else {
       setError(result.error || 'Error al revisar el pago');
     }
   };
 
   const prevMonth = () => {
     if (selectedMonth === 1) {
       setSelectedMonth(12);
       setSelectedYear(selectedYear - 1);
     } else {
       setSelectedMonth(selectedMonth - 1);
     }
   };
 
   const nextMonth = () => {
     if (selectedMonth === 12) {
       setSelectedMonth(1);
       setSelectedYear(selectedYear + 1);
     } else {
       setSelectedMonth(selectedMonth + 1);
     }
   };
 
   return (
     <div className="space-y-6 animate-fade-in">
       <div>
         <h2 className="text-2xl font-bold text-[#2D2A32]">Pagos reportados</h2>
         <p className="text-[#6B6570] mt-1">
           Verifica los pagos registrados por profesionales
         </p>
       </div>
 
       <Card variant="soft" className="space-y-4">
         <div className="flex items-center justify-between">
           <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition-colors">
             <ChevronLeft size={24} className="text-[#6B6570]" />
           </button>
 
           <div className="flex items-center gap-4">
             <select
               value={selectedYear}
               onChange={(e) => setSelectedYear(parseInt(e.target.value))}
               className="px-3 py-1.5 rounded-lg border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white text-sm"
             >
               {years.map((y) => (
                 <option key={y} value={y}>{y}</option>
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
 
           <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition-colors">
             <ChevronRight size={24} className="text-[#6B6570]" />
           </button>
         </div>
       </Card>
 
       <Card>
         <div className="flex items-center gap-2 mb-6">
           <Wallet className="text-[#A38EC3]" size={24} />
           <h3 className="text-lg font-semibold text-[#2D2A32]">
             Pagos del período - {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
           </h3>
         </div>
 
         {error && (
           <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl">
             {error}
           </div>
         )}
 
         {success && (
           <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl">
             {success}
           </div>
         )}
 
          {loading ? (
            <SkeletonList count={4} />
          ) : payments.length === 0 ? (
           <div className="p-8 text-center text-[#6B6570]">No hay pagos registrados en este período</div>
         ) : (
           <div className="space-y-3">
             {payments.map((p) => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-xl gap-3">
                  <div>
                    <p className="font-medium text-[#2D2A32]">
                      {p.professional?.full_name || 'Profesional'} • {formatCurrency(p.amount)}
                    </p>
                    <p className="text-xs text-[#6B6570]">
                      {new Date(p.payment_date).toLocaleDateString('es-CL')} • {p.payment_type === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                    </p>
                    {p.notes && <p className="text-xs text-[#78716C] mt-1">{p.notes}</p>}
                  </div>

                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
                    <Button
                      variant="outline"
                     size="sm"
                      onClick={() => handleReview(p.id, 'approved')}
                      disabled={p.verification_status === 'approved'}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                     size="sm"
                      onClick={() => handleReview(p.id, 'rejected')}
                      disabled={p.verification_status === 'rejected'}
                    >
                      <XCircle size={16} className="mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </div>
             ))}
 
             <div className="pt-3 border-t border-gray-200">
               <div className="flex justify-between text-sm">
                 <span className="text-[#6B6570]">Total reportado:</span>
                 <span className="font-medium text-[#2D2A32]">{formatCurrency(totalAmount)}</span>
               </div>
             </div>
           </div>
         )}
       </Card>
     </div>
   );
 }
