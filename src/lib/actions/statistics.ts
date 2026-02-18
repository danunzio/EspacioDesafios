'use server';

import { createClient } from '@/lib/supabase/server';

export interface MonthlyStats {
  year: number;
  month: number;
  totalSessions: number;
  totalAmount: number;
  professionalCount: number;
  childrenCount: number;
}

export interface ProfessionalStats {
  professionalId: string;
  professionalName: string;
  totalSessions: number;
  totalAmount: number;
  childrenCount: number;
}

export interface DashboardStats {
  totalProfessionals: number;
  activeProfessionals: number;
  totalChildren: number;
  activeChildren: number;
  currentMonthSessions: number;
  currentMonthAmount: number;
  totalLiquidationsPending: number;
  totalLiquidationsPaid: number;
}

/**
 * Get monthly statistics for a year
 * @param year - The year
 * @returns Monthly statistics
 */
export async function getMonthlyStats(
  year: number
): Promise<{ success: boolean; data?: MonthlyStats[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Get monthly sessions data
    const { data: sessions, error: sessionsError } = await supabase
      .from('monthly_sessions')
      .select('year, month, session_count, module:module_values(base_value)')
      .eq('year', year)
      .eq('is_confirmed', true);

    if (sessionsError) {
      throw new Error(`Error fetching sessions: ${sessionsError.message}`);
    }

    // Get monthly unique professionals and children
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('monthly_sessions')
      .select('year, month, professional_id, child_id')
      .eq('year', year)
      .eq('is_confirmed', true);

    if (monthlyError) {
      throw new Error(`Error fetching monthly data: ${monthlyError.message}`);
    }

    // Process data by month
    const statsMap = new Map<number, MonthlyStats>();

    for (let month = 1; month <= 12; month++) {
      statsMap.set(month, {
        year,
        month,
        totalSessions: 0,
        totalAmount: 0,
        professionalCount: 0,
        childrenCount: 0
      });
    }

    // Calculate sessions and amounts
    for (const session of sessions || []) {
      const month = session.month;
      const count = session.session_count || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const moduleData = session.module as any;
      const rate = Array.isArray(moduleData)
        ? moduleData[0]?.base_value || 0
        : moduleData?.base_value || 0;

      const stat = statsMap.get(month);
      if (stat) {
        stat.totalSessions += count;
        stat.totalAmount += count * rate;
      }
    }

    // Calculate unique professionals and children per month
    const monthProfessionals = new Map<number, Set<string>>();
    const monthChildren = new Map<number, Set<string>>();

    for (const data of monthlyData || []) {
      const month = data.month;

      if (!monthProfessionals.has(month)) {
        monthProfessionals.set(month, new Set());
        monthChildren.set(month, new Set());
      }

      monthProfessionals.get(month)?.add(data.professional_id);
      monthChildren.get(month)?.add(data.child_id);
    }

    for (const [month, professionals] of monthProfessionals.entries()) {
      const stat = statsMap.get(month);
      if (stat) {
        stat.professionalCount = professionals.size;
        stat.childrenCount = monthChildren.get(month)?.size || 0;
      }
    }

    return {
      success: true,
      data: Array.from(statsMap.values())
    };
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas mensuales'
    };
  }
}

/**
 * Get professional statistics for a year/month
 * @param year - The year
 * @param month - Optional month filter
 * @returns Professional statistics
 */
export async function getProfessionalStats(
  year: number,
  month?: number
): Promise<{ success: boolean; data?: ProfessionalStats[]; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('monthly_sessions')
      .select(`
        professional_id,
        professional:profiles(full_name),
        session_count,
        module:module_values(base_value),
        child_id
      `)
      .eq('year', year)
      .eq('is_confirmed', true);

    if (month !== undefined) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching professional stats: ${error.message}`);
    }

    // Process data by professional
    const statsMap = new Map<string, {
      name: string;
      sessions: number;
      amount: number;
      children: Set<string>;
    }>();

    for (const item of data || []) {
      const profId = item.professional_id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profData = item.professional as any;
      const profName = Array.isArray(profData)
        ? profData[0]?.full_name || 'Desconocido'
        : profData?.full_name || 'Desconocido';
      const count = item.session_count || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const moduleData = item.module as any;
      const rate = Array.isArray(moduleData)
        ? moduleData[0]?.base_value || 0
        : moduleData?.base_value || 0;

      if (!statsMap.has(profId)) {
        statsMap.set(profId, {
          name: profName,
          sessions: 0,
          amount: 0,
          children: new Set()
        });
      }

      const stat = statsMap.get(profId)!;
      stat.sessions += count;
      stat.amount += count * rate;
      stat.children.add(item.child_id);
    }

    const result: ProfessionalStats[] = Array.from(statsMap.entries()).map(([id, data]) => ({
      professionalId: id,
      professionalName: data.name,
      totalSessions: data.sessions,
      totalAmount: data.amount,
      childrenCount: data.children.size
    }));

    // Sort by total amount desc
    result.sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching professional stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas por profesional'
    };
  }
}

/**
 * Get dashboard statistics
 * @returns Dashboard statistics
 */
export async function getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  try {
    const supabase = await createClient();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get professionals count
    const { count: totalProfessionals, error: profError1 } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'professional');

    const { count: activeProfessionals, error: profError2 } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'professional')
      .eq('is_active', true);

    if (profError1 || profError2) {
      throw new Error('Error fetching professionals count');
    }

    // Get children count
    const { count: totalChildren, error: childError1 } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true });

    const { count: activeChildren, error: childError2 } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (childError1 || childError2) {
      throw new Error('Error fetching children count');
    }

    // Get current month sessions
    const { data: currentSessions, error: sessionsError } = await supabase
      .from('monthly_sessions')
      .select('session_count, module:module_values(base_value)')
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .eq('is_confirmed', true);

    if (sessionsError) {
      throw new Error(`Error fetching sessions: ${sessionsError.message}`);
    }

    let currentMonthSessions = 0;
    let currentMonthAmount = 0;

    for (const session of currentSessions || []) {
      const count = session.session_count || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const moduleData = session.module as any;
      const rate = Array.isArray(moduleData)
        ? moduleData[0]?.base_value || 0
        : moduleData?.base_value || 0;

      currentMonthSessions += count;
      currentMonthAmount += count * rate;
    }

    // Get liquidations status
    const { data: liquidations, error: liqError } = await supabase
      .from('liquidations')
      .select('status')
      .eq('year', currentYear)
      .eq('month', currentMonth);

    if (liqError) {
      throw new Error(`Error fetching liquidations: ${liqError.message}`);
    }

    const totalLiquidationsPending = liquidations?.filter(l => l.status === 'pending').length || 0;
    const totalLiquidationsPaid = liquidations?.filter(l => l.status === 'paid').length || 0;

    return {
      success: true,
      data: {
        totalProfessionals: totalProfessionals || 0,
        activeProfessionals: activeProfessionals || 0,
        totalChildren: totalChildren || 0,
        activeChildren: activeChildren || 0,
        currentMonthSessions,
        currentMonthAmount,
        totalLiquidationsPending,
        totalLiquidationsPaid
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas del dashboard'
    };
  }
}

/**
 * Get financial health data (Income vs Expenses)
 * @param year - The year
 * @returns Monthly income vs expenses
 */
export async function getFinancialHealth(
  year: number
): Promise<{ success: boolean; data?: Array<{ month: number; income: number; expenses: number }>; error?: string }> {
  try {
    const supabase = await createClient();

    // Get payments to clinic (income)
    const { data: payments, error: paymentsError } = await supabase
      .from('payments_to_clinic')
      .select('month, amount')
      .eq('year', year)
      .eq('verification_status', 'approved');

    if (paymentsError) throw new Error(`Error income: ${paymentsError.message}`);

    // Get expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('month, amount')
      .eq('year', year);

    if (expensesError) throw new Error(`Error expenses: ${expensesError.message}`);

    const monthlyFinancials = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expenses: 0
    }));

    for (const payment of payments || []) {
      monthlyFinancials[payment.month - 1].income += Number(payment.amount);
    }

    for (const expense of expenses || []) {
      monthlyFinancials[expense.month - 1].expenses += Number(expense.amount);
    }

    return { success: true, data: monthlyFinancials };
  } catch (error) {
    console.error('Error financial health:', error);
    return { success: false, error: 'Error al obtener salud financiera' };
  }
}

/**
 * Get payment verification status distribution
 * @returns Status counts
 */
export async function getPaymentStatusDistribution(): Promise<{ success: boolean; data?: Array<{ name: string; value: number; color: string }>; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('payments_to_clinic')
      .select('verification_status');

    if (error) throw new Error(error.message);

    const counts = {
      pending: data?.filter(p => p.verification_status === 'pending').length || 0,
      approved: data?.filter(p => p.verification_status === 'approved').length || 0,
      rejected: data?.filter(p => p.verification_status === 'rejected').length || 0,
    };

    const result = [
      { name: 'Pendientes', value: counts.pending, color: '#F9E79F' },
      { name: 'Aprobados', value: counts.approved, color: '#A8E6CF' },
      { name: 'Rechazados', value: counts.rejected, color: '#F4C2C2' },
    ];

    return { success: true, data: result.filter(r => r.value > 0) };
  } catch (error) {
    console.error('Error payment status:', error);
    return { success: false, error: 'Error al obtener estado de pagos' };
  }
}

/**
 * Get value types distribution
 * @returns Distribution of values by type
 */
export async function getValueTypesDistribution(): Promise<{ success: boolean; data?: Array<{ name: string; value: number; color: string }>; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('value_history')
      .select('value_type, value, year, month')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      throw new Error(`Error fetching value distribution: ${error.message}`);
    }

    // Get the most recent value for each type
    const latestValues = new Map<string, { value: number; year: number; month: number }>();

    for (const item of data || []) {
      const existing = latestValues.get(item.value_type);
      if (!existing ||
        item.year > existing.year ||
        (item.year === existing.year && item.month > existing.month)) {
        latestValues.set(item.value_type, {
          value: item.value,
          year: item.year,
          month: item.month
        });
      }
    }

    const colors: Record<string, string> = {
      'nomenclatura': '#A38EC3',
      'modulos': '#F4C2C2',
      'osde': '#A8E6CF',
      'sesion': '#F9E79F'
    };

    const labels: Record<string, string> = {
      'nomenclatura': 'Nomenclador',
      'modulos': 'Módulos',
      'osde': 'OSDE',
      'sesion': 'Sesión Individual'
    };

    const result = Array.from(latestValues.entries()).map(([type, data]) => ({
      name: labels[type] || type,
      value: data.value,
      color: colors[type] || '#9A94A0'
    }));

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching value distribution:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener distribución de valores'
    };
  }
}

/**
 * Get professionals who haven't registered any payments in a given period
 * @param year - The year
 * @param month - The month
 * @returns List of professionals without payments
 */
export async function getProfessionalsWithoutPayments(
  year: number,
  month: number
): Promise<{ success: boolean; data?: Array<{ id: string; full_name: string; email: string }>; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Get all active professionals
    const { data: professionals, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'professional')
      .eq('is_active', true);

    if (profError) throw new Error(`Error fetching professionals: ${profError.message}`);

    // 2. Get distinct professional_ids who actually registered payments in this period
    const { data: payments, error: payError } = await supabase
      .from('payments_to_clinic')
      .select('professional_id')
      .eq('year', year)
      .eq('month', month);

    if (payError) throw new Error(`Error fetching payments: ${payError.message}`);

    const paidProfessionalIds = new Set(payments?.map(p => p.professional_id) || []);

    // 3. Filter those who are NOT in the paid list
    const unpaidProfessionals = professionals?.filter(p => !paidProfessionalIds.has(p.id)) || [];

    return {
      success: true,
      data: unpaidProfessionals
    };
  } catch (error) {
    console.error('Error fetching professionals without payments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener profesionales sin pagos'
    };
  }
}
