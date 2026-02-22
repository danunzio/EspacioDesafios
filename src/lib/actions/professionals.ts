'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateProfessionalData {
  full_name: string
  email: string
  phone?: string
  password: string
  specialization?: string
  license_number?: string
}

export interface UpdateProfessionalData {
  full_name?: string
  email?: string
  phone?: string
  specialization?: string
  license_number?: string
  is_active?: boolean
}

export interface Professional {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: string
  is_active: boolean
  specialization: string | null
  license_number: string | null
  created_at: string
  updated_at: string
}

export interface ProfessionalStats {
  assignedChildren: number
  currentMonthSessions: number
  currentMonthAmount: number
}

/**
 * Create a new professional
 * Creates both the auth user and the profile
 * @param data - The professional data
 * @returns Success status
 */
export async function createProfessional(
  data: CreateProfessionalData
): Promise<{ success: boolean; data?: Professional; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user for authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Verify user is admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || adminProfile?.role !== 'admin') {
      throw new Error('No tiene permisos para realizar esta acción')
    }

    // Check if email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', data.email.toLowerCase())
      .maybeSingle()

    if (existingProfile) {
      throw new Error('Este correo electrónico ya está registrado')
    }

    // Step 1: Create user in Supabase Auth
    // Note: This requires admin privileges or should be done via a secure API
    // For production, you might want to use Supabase's admin API or edge functions
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      options: {
        data: {
          full_name: data.full_name.trim(),
          role: 'professional',
        },
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('Este correo electrónico ya está registrado')
      }
      throw new Error(`Error al crear usuario: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario')
    }

    // Step 2: Create profile in profiles table
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email.toLowerCase().trim(),
        full_name: data.full_name.trim(),
        phone: data.phone?.trim() || null,
        specialization: data.specialization?.trim() || null,
        license_number: data.license_number?.trim() || null,
        role: 'professional',
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      // Note: In production, you might want to clean up the auth user here
      // This would require admin privileges
      console.error('Profile creation error:', insertError)
      throw new Error(`Error al crear el perfil: ${insertError.message}`)
    }

    revalidatePath('/admin/profesionales')
    revalidatePath('/admin')

    return {
      success: true,
      data: profile,
    }
  } catch (error) {
    console.error('Error creating professional:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el profesional',
    }
  }
}

/**
 * Get all professionals
 * @param includeInactive - Whether to include inactive professionals
 * @returns List of professionals
 */
export async function getProfessionals(
  includeInactive: boolean = false
): Promise<{ success: boolean; data?: Professional[]; error?: string }> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'professional')
      .order('full_name')

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener los profesionales: ${error.message}`)
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error('Error fetching professionals:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los profesionales',
    }
  }
}

/**
 * Get a single professional by ID
 * @param id - The professional ID
 * @returns The professional data
 */
export async function getProfessionalById(
  id: string
): Promise<{ success: boolean; data?: Professional; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'professional')
      .single()

    if (error) {
      throw new Error(`Error al obtener el profesional: ${error.message}`)
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error fetching professional:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el profesional',
    }
  }
}

/**
 * Update a professional
 * @param id - The professional ID
 * @param data - The updated professional data
 * @returns Success status
 */
export async function updateProfessional(
  id: string,
  data: UpdateProfessionalData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user for authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Verify user is admin or the professional themselves
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error('Error al verificar permisos')
    }

    if (currentProfile?.role !== 'admin' && user.id !== id) {
      throw new Error('No tiene permisos para realizar esta acción')
    }

    // Check if email is being changed and if it already exists
    if (data.email) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (existingProfile) {
        throw new Error('Este correo electrónico ya está registrado')
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, string | boolean | null> = {}

    if (data.full_name !== undefined) updateData.full_name = data.full_name.trim()
    if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim()
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null
    if (data.specialization !== undefined) updateData.specialization = data.specialization?.trim() || null
    if (data.license_number !== undefined) updateData.license_number = data.license_number?.trim() || null
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'professional')

    if (error) {
      throw new Error(`Error al actualizar el profesional: ${error.message}`)
    }

    revalidatePath('/admin/profesionales')
    revalidatePath('/admin')
    revalidatePath(`/admin/profesionales/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating professional:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el profesional',
    }
  }
}

/**
 * Soft delete a professional (mark as inactive)
 * @param id - The professional ID
 * @returns Success status
 */
export async function deleteProfessional(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user for authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Verify user is admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || adminProfile?.role !== 'admin') {
      throw new Error('No tiene permisos para realizar esta acción')
    }

    // Check if professional has assigned children (both direct and relation)
    const [directResult, relationResult] = await Promise.all([
      supabase
        .from('children')
        .select('id')
        .eq('assigned_professional_id', id)
        .eq('is_active', true),
      supabase
        .from('children_professionals')
        .select('child_id')
        .eq('professional_id', id)
    ])

    const directChildren = directResult.data || [];
    const relationChildIds = relationResult.data?.map(r => r.child_id) || [];
    
    let relationChildren: { id: string }[] = [];
    if (relationChildIds.length > 0) {
      const relationResult2 = await supabase
        .from('children')
        .select('id')
        .in('id', relationChildIds)
        .eq('is_active', true);
      relationChildren = relationResult2.data || [];
    }

    const allAssignedChildren = [...directChildren, ...relationChildren];

    if (allAssignedChildren.length > 0) {
      throw new Error(
        `No se puede desactivar el profesional porque tiene ${allAssignedChildren.length} niño(s) asignado(s). ` +
        'Por favor, reasigne los niños a otro profesional primero.'
      )
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('role', 'professional')

    if (error) {
      throw new Error(`Error al desactivar el profesional: ${error.message}`)
    }

    revalidatePath('/admin/profesionales')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error deleting professional:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al desactivar el profesional',
    }
  }
}

/**
 * Reactivate a professional
 * @param id - The professional ID
 * @returns Success status
 */
export async function reactivateProfessional(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user for authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Usuario no autenticado')
    }

    // Verify user is admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || adminProfile?.role !== 'admin') {
      throw new Error('No tiene permisos para realizar esta acción')
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('role', 'professional')

    if (error) {
      throw new Error(`Error al reactivar el profesional: ${error.message}`)
    }

    revalidatePath('/admin/profesionales')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error reactivating professional:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reactivar el profesional',
    }
  }
}

/**
 * Get professional statistics
 * @param professionalId - The professional ID
 * @returns Statistics data
 */
export async function getProfessionalStats(
  professionalId: string
): Promise<{ success: boolean; data?: ProfessionalStats; error?: string }> {
  try {
    const supabase = await createClient()

    // Get assigned children count from both sources
    const [directResult, relationResult] = await Promise.all([
      supabase
        .from('children')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_professional_id', professionalId)
        .eq('is_active', true),
      supabase
        .from('children_professionals')
        .select('child_id', { count: 'exact', head: true })
        .eq('professional_id', professionalId)
    ])

    const directCount = directResult.count || 0;
    const relationCount = relationResult.count || 0;
    
    let relationChildIds: string[] = [];
    if (relationResult.data) {
      relationChildIds = relationResult.data.map(r => r.child_id);
    }

    let relationChildrenCount = 0;
    if (relationChildIds.length > 0) {
      const relationChildrenResult = await supabase
        .from('children')
        .select('id', { count: 'exact', head: true })
        .in('id', relationChildIds)
        .eq('is_active', true);
      relationChildrenCount = relationChildrenResult.count || 0;
    }

    const childrenCount = directCount + relationChildrenCount;

    // Get session statistics for current month
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const { data: monthlySessions, error: sessionsError } = await supabase
      .from('monthly_sessions')
      .select('session_count, total_amount')
      .eq('professional_id', professionalId)
      .eq('month', currentMonth)
      .eq('year', currentYear)

    if (sessionsError) {
      throw new Error(`Error fetching sessions: ${sessionsError.message}`)
    }

    const stats = {
      assignedChildren: childrenCount || 0,
      currentMonthSessions: monthlySessions?.reduce((sum, s) => sum + (s.session_count || 0), 0) || 0,
      currentMonthAmount: monthlySessions?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0,
    }

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error('Error fetching professional stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
    }
  }
}
