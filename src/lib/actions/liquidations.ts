'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Internal function to get professional commission (can't import from values.ts in use server files)
async function getProfessionalCommissionInternal(
  professionalId: string,
  valueType: string
): Promise<{ success: boolean; percentage?: number; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('professional_modules')
      .select('commission_percentage')
      .eq('professional_id', professionalId)
      .eq('value_type', valueType)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Error fetching commission: ${error.message}`);
    }

    // Default to 25% if not configured
    const percentage = data?.commission_percentage ?? 25;

    return {
      success: true,
      percentage
    };
  } catch (error) {
    console.error('Error fetching professional commission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener la comisión'
    };
  }
}

export interface LiquidationCalculation {
  professionalId: string;
  year: number;
  month: number;
  totalSessions: number;
  totalAmount: number;
  professionalPercentage: number;
  professionalAmount: number;
  clinicAmount: number;
  moduleBreakdown: ModuleBreakdown[];
}

export interface ModuleBreakdown {
  moduleName: string;
  sessionCount: number;
  rate: number;
  amount: number;
}

export interface Liquidation {
  id: string;
  professional_id: string;
  year: number;
  month: number;
  total_sessions: number;
  total_amount: number;
  professional_percentage: number;
  professional_amount: number;
  clinic_amount: number;
  module_breakdown: ModuleBreakdown[];
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  approved_at: string | null;
  approved_by: string | null;
  paid_at: string | null;
  paid_by: string | null;
  payment_reference: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
  professional?: {
    full_name: string;
    email: string;
  };
}

export interface LiquidationStats {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  cancelled: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

/**
 * Calculate liquidation for a professional in a specific month
 * @param professionalId - The professional ID
 * @param year - The year
 * @param month - The month (1-12)
 * @returns The calculated liquidation details
 */
export async function calculateLiquidation(
  professionalId: string,
  year: number,
  month: number
): Promise<{ success: boolean; data?: LiquidationCalculation; error?: string }> {
  try {
    const supabase = await createClient();

    // Fetch all sessions for the professional in the given month
    const { data: sessions, error: sessionsError } = await supabase
      .from('monthly_sessions')
      .select(`
        module_name,
        session_count
      `)
      .eq('professional_id', professionalId)
      .eq('year', year)
    .eq('month', month)
    .gt('session_count', 0);
    // We removed is_confirmed=true to allow professionals to see their estimated earnings
    // before admin confirms them, if the system is designed to show "draft" liquidations.
    // If we want ONLY confirmed, we keep it, but the user wants "impact".

    if (sessionsError) {
      throw new Error(`Error fetching sessions: ${sessionsError.message}`);
    }

    if (!sessions || sessions.length === 0) {
      return {
        success: true,
        data: {
          professionalId,
          year,
          month,
          totalSessions: 0,
          totalAmount: 0,
          professionalPercentage: 25,
          professionalAmount: 0,
          clinicAmount: 0,
          moduleBreakdown: []
        }
      };
    }

    // Fetch value rates for this month/year for all types
    const { data: valueRates, error: ratesError } = await supabase
      .from('value_history')
      .select('value_type, value')
      .eq('year', year)
      .eq('month', month);

    if (ratesError) {
      throw new Error(`Error fetching rates: ${ratesError.message}`);
    }

    const ratesMap = new Map<string, number>();
    (valueRates || []).forEach(v => ratesMap.set(v.value_type, parseFloat(v.value.toString())));

    // Calculate totals by module
    const moduleMap = new Map<string, { count: number; rate: number }>();

    for (const session of sessions) {
      const moduleName = session.module_name;
      const count = session.session_count || 0;
      const rate = ratesMap.get(moduleName) || 0;

      if (moduleMap.has(moduleName)) {
        const existing = moduleMap.get(moduleName)!;
        moduleMap.set(moduleName, {
          count: existing.count + count,
          rate
        });
      } else {
        moduleMap.set(moduleName, { count, rate });
      }
    }

    // Build module breakdown
    const moduleBreakdown: ModuleBreakdown[] = [];
    let totalSessions = 0;
    let totalAmount = 0;

    for (const [moduleName, data] of moduleMap.entries()) {
      const amount = data.count * data.rate;
      moduleBreakdown.push({
        moduleName,
        sessionCount: data.count,
        rate: data.rate,
        amount
      });
      totalSessions += data.count;
      totalAmount += amount;
    }

    // Sort by module name
    moduleBreakdown.sort((a, b) => a.moduleName.localeCompare(b.moduleName));

    // Get professional commission percentages
    const { data: profModules } = await supabase
      .from('professional_modules')
      .select('value_type, commission_percentage')
      .eq('professional_id', professionalId)
      .eq('is_active', true);

    const profCommMap = new Map<string, number>();
    profModules?.forEach(pm => profCommMap.set(pm.value_type, pm.commission_percentage));

    // For historical compatibility/main percentage, get 'modulos' or first available
    const mainPercentage = profCommMap.get('modulos') || profCommMap.values().next().value || 25;

    // Calculate professional amount by applying individual module commissions
    let totalProfessionalAmount = 0;
    moduleBreakdown.forEach(mb => {
      const comm = profCommMap.get(mb.moduleName) || 25;
      totalProfessionalAmount += mb.amount * (comm / 100);
    });

    return {
      success: true,
      data: {
        professionalId,
        year,
        month,
        totalSessions,
        totalAmount,
        professionalPercentage: mainPercentage,
        professionalAmount: totalProfessionalAmount,
        clinicAmount: totalAmount - totalProfessionalAmount,
        moduleBreakdown
      }
    };
  } catch (error) {
    console.error('Error calculating liquidation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al calcular la liquidación'
    };
  }
}

/**
 * Get liquidations with optional filters
 * @param year - Optional year filter
 * @param month - Optional month filter
 * @param professionalId - Optional professional ID filter
 * @returns List of liquidations
 */
export async function getLiquidations(
  year?: number,
  month?: number,
  professionalId?: string
): Promise<{ success: boolean; data?: Liquidation[]; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('liquidations')
      .select(`
        *,
        professional:profiles(full_name, email)
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (year !== undefined) {
      query = query.eq('year', year);
    }

    if (month !== undefined) {
      query = query.eq('month', month);
    }

    if (professionalId) {
      query = query.eq('professional_id', professionalId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching liquidations: ${error.message}`);
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching liquidations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las liquidaciones'
    };
  }
}

/**
 * Create or update a liquidation
 * @param professionalId - The professional ID
 * @param year - The year
 * @param month - The month
 * @returns Success status
 */
export async function createOrUpdateLiquidation(
  professionalId: string,
  year: number,
  month: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // First calculate the liquidation
    const calculation = await calculateLiquidation(professionalId, year, month);

    if (!calculation.success || !calculation.data) {
      throw new Error(calculation.error || 'Error al calcular la liquidación');
    }

    const supabase = await createClient();

    // Upsert the liquidation
    const { error } = await supabase
      .from('liquidations')
      .upsert({
        professional_id: professionalId,
        year,
        month,
        total_sessions: calculation.data.totalSessions,
        total_amount: calculation.data.totalAmount,
        professional_percentage: calculation.data.professionalPercentage,
        professional_amount: calculation.data.professionalAmount,
        clinic_amount: calculation.data.clinicAmount,
        module_breakdown: calculation.data.moduleBreakdown,
        status: 'pending'
      }, {
        onConflict: 'professional_id,year,month'
      });

    if (error) {
      throw new Error(`Error saving liquidation: ${error.message}`);
    }

    revalidatePath('/liquidaciones');
    revalidatePath(`/liquidaciones/${year}/${month}`);

    return { success: true };
  } catch (error) {
    console.error('Error creating/updating liquidation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear/actualizar la liquidación'
    };
  }
}

/**
 * Mark a liquidation as paid
 * @param liquidationId - The liquidation ID
 * @param paymentReference - Optional payment reference
 * @returns Success status
 */
export async function markLiquidationAsPaid(
  liquidationId: string,
  paymentReference?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Update the liquidation
    const { error } = await supabase
      .from('liquidations')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        paid_by: user.id,
        payment_reference: paymentReference || null
      })
      .eq('id', liquidationId);

    if (error) {
      throw new Error(`Error updating liquidation: ${error.message}`);
    }

    revalidatePath('/liquidaciones');
    revalidatePath(`/liquidaciones/${liquidationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error marking liquidation as paid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al marcar la liquidación como pagada'
    };
  }
}

/**
 * Approve a liquidation
 * @param liquidationId - The liquidation ID
 * @returns Success status
 */
export async function approveLiquidation(
  liquidationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Update the liquidation
    const { error } = await supabase
      .from('liquidations')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id
      })
      .eq('id', liquidationId);

    if (error) {
      throw new Error(`Error approving liquidation: ${error.message}`);
    }

    revalidatePath('/liquidaciones');
    revalidatePath(`/liquidaciones/${liquidationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error approving liquidation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al aprobar la liquidación'
    };
  }
}

/**
 * Cancel a liquidation
 * @param liquidationId - The liquidation ID
 * @returns Success status
 */
export async function cancelLiquidation(
  liquidationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Update the liquidation
    const { error } = await supabase
      .from('liquidations')
      .update({
        status: 'cancelled'
      })
      .eq('id', liquidationId);

    if (error) {
      throw new Error(`Error cancelling liquidation: ${error.message}`);
    }

    revalidatePath('/liquidaciones');
    revalidatePath(`/liquidaciones/${liquidationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error cancelling liquidation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar la liquidación'
    };
  }
}

/**
 * Get liquidation statistics
 * @param year - The year
 * @param month - Optional month filter
 * @returns Statistics data
 */
export async function getLiquidationStats(
  year: number,
  month?: number
): Promise<{ success: boolean; data?: LiquidationStats; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('liquidations')
      .select('status, total_amount')
      .eq('year', year);

    if (month !== undefined) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching stats: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(l => l.status === 'pending').length || 0,
      approved: data?.filter(l => l.status === 'approved').length || 0,
      paid: data?.filter(l => l.status === 'paid').length || 0,
      cancelled: data?.filter(l => l.status === 'cancelled').length || 0,
      totalAmount: data?.reduce((sum, l) => sum + (l.total_amount || 0), 0) || 0,
      paidAmount: data?.filter(l => l.status === 'paid').reduce((sum, l) => sum + (l.total_amount || 0), 0) || 0,
      pendingAmount: data?.filter(l => l.status === 'pending').reduce((sum, l) => sum + (l.total_amount || 0), 0) || 0
    };

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error fetching liquidation stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    };
  }
}
