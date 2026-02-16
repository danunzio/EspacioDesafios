'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ValueHistory {
  id: string;
  value_type: 'nomenclatura' | 'modulos' | 'osde' | 'sesion';
  year: number;
  month: number;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  year: number;
  month: number;
  category: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get value history for a specific type
 * @param valueType - The value type
 * @returns List of value history entries
 */
export async function getValueHistory(
  valueType: string
): Promise<{ success: boolean; data?: ValueHistory[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('value_history')
      .select('*')
      .eq('value_type', valueType)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      throw new Error(`Error fetching value history: ${error.message}`);
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching value history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el historial de valores'
    };
  }
}

/**
 * Get all value histories
 * @returns List of all value history entries
 */
export async function getAllValueHistories(): Promise<{ success: boolean; data?: ValueHistory[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('value_history')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      throw new Error(`Error fetching value histories: ${error.message}`);
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching value histories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los valores'
    };
  }
}

/**
 * Create or update a value
 * @param valueData - The value data
 * @returns Success status
 */
export async function createOrUpdateValue(
  valueData: Omit<ValueHistory, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Check if a value already exists for this type, year, and month
    const { data: existingValue } = await supabase
      .from('value_history')
      .select('id')
      .eq('value_type', valueData.value_type)
      .eq('year', valueData.year)
      .eq('month', valueData.month)
      .single();

    if (existingValue) {
      // Update existing value
      const { error } = await supabase
        .from('value_history')
        .update({
          value: valueData.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingValue.id);

      if (error) {
        throw new Error(`Error updating value: ${error.message}`);
      }
    } else {
      // Insert new value
      const { error } = await supabase
        .from('value_history')
        .insert({
          value_type: valueData.value_type,
          year: valueData.year,
          month: valueData.month,
          value: valueData.value
        });

      if (error) {
        throw new Error(`Error creating value: ${error.message}`);
      }
    }

    revalidatePath('/admin/valores');
    return { success: true };
  } catch (error) {
    console.error('Error creating/updating value:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al guardar el valor'
    };
  }
}

/**
 * Delete a value
 * @param id - The value ID
 * @returns Success status
 */
export async function deleteValue(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('value_history')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting value: ${error.message}`);
    }

    revalidatePath('/admin/valores');
    return { success: true };
  } catch (error) {
    console.error('Error deleting value:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el valor'
    };
  }
}

/**
 * Get expenses with optional filters
 * @param year - Optional year filter
 * @param month - Optional month filter
 * @returns List of expenses
 */
export async function getExpenses(
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: Expense[]; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('expenses')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (year !== undefined) {
      query = query.eq('year', year);
    }

    if (month !== undefined) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching expenses: ${error.message}`);
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los consumos'
    };
  }
}

/**
 * Create an expense
 * @param expenseData - The expense data
 * @returns Success status
 */
export async function createExpense(
  expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('expenses')
      .insert(expenseData);

    if (error) {
      throw new Error(`Error creating expense: ${error.message}`);
    }

    revalidatePath('/admin/consumos');
    return { success: true };
  } catch (error) {
    console.error('Error creating expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el consumo'
    };
  }
}

/**
 * Update an expense
 * @param id - The expense ID
 * @param expenseData - The expense data to update
 * @returns Success status
 */
export async function updateExpense(
  id: string,
  expenseData: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('expenses')
      .update({
        ...expenseData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating expense: ${error.message}`);
    }

    revalidatePath('/admin/consumos');
    return { success: true };
  } catch (error) {
    console.error('Error updating expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el consumo'
    };
  }
}

/**
 * Delete an expense
 * @param id - The expense ID
 * @returns Success status
 */
export async function deleteExpense(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting expense: ${error.message}`);
    }

    revalidatePath('/admin/consumos');
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el consumo'
    };
  }
}

/**
 * Get expense statistics
 * @param year - The year
 * @param month - Optional month filter
 * @returns Statistics data
 */
export async function getExpenseStats(
  year: number,
  month?: number
): Promise<{ success: boolean; data?: { total: number; byCategory: Record<string, number> }; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('expenses')
      .select('category, amount')
      .eq('year', year);

    if (month !== undefined) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching expense stats: ${error.message}`);
    }

    const total = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const byCategory: Record<string, number> = {};

    data?.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0);
    });

    return {
      success: true,
      data: { total, byCategory }
    };
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    };
  }
}

// =====================================================
// PROFESSIONAL MODULES
// =====================================================

export interface ProfessionalModule {
  id: string;
  professional_id: string;
  value_type: 'nomenclatura' | 'modulos' | 'osde' | 'sesion';
  commission_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get professional modules configuration
 * @param professionalId - The professional ID
 * @returns List of professional module configurations
 */
export async function getProfessionalModules(
  professionalId: string
): Promise<{ success: boolean; data?: ProfessionalModule[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('professional_modules')
      .select('*')
      .eq('professional_id', professionalId)
      .order('value_type');

    if (error) {
      throw new Error(`Error fetching professional modules: ${error.message}`);
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching professional modules:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener la configuración de módulos'
    };
  }
}

/**
 * Create or update a professional module
 * @param professionalId - The professional ID
 * @param valueType - The value type
 * @param commissionPercentage - The commission percentage
 * @returns Success status
 */
export async function createOrUpdateProfessionalModule(
  professionalId: string,
  valueType: string,
  commissionPercentage: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from('professional_modules')
      .select('id')
      .eq('professional_id', professionalId)
      .eq('value_type', valueType)
      .single();

    if (existingConfig) {
      // Update existing
      const { error } = await supabase
        .from('professional_modules')
        .update({
          commission_percentage: commissionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id);

      if (error) {
        throw new Error(`Error updating professional module: ${error.message}`);
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('professional_modules')
        .insert({
          professional_id: professionalId,
          value_type: valueType,
          commission_percentage: commissionPercentage,
          is_active: true
        });

      if (error) {
        throw new Error(`Error creating professional module: ${error.message}`);
      }
    }

    revalidatePath(`/admin/profesionales/${professionalId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating/updating professional module:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al guardar la configuración'
    };
  }
}

/**
 * Toggle professional module active status
 * @param moduleId - The module configuration ID
 * @param isActive - The new active status
 * @returns Success status
 */
export async function toggleProfessionalModule(
  moduleId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('professional_modules')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleId);

    if (error) {
      throw new Error(`Error toggling professional module: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error toggling professional module:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el estado'
    };
  }
}

/**
 * Delete a professional module
 * @param moduleId - The module configuration ID
 * @returns Success status
 */
export async function deleteProfessionalModule(
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('professional_modules')
      .delete()
      .eq('id', moduleId);

    if (error) {
      throw new Error(`Error deleting professional module: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting professional module:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la configuración'
    };
  }
}

/**
 * Get commission percentage for a professional and value type
 * @param professionalId - The professional ID
 * @param valueType - The value type
 * @returns The commission percentage (defaults to 25 if not configured)
 */
export async function getProfessionalCommission(
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
