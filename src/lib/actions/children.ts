'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateChildData {
  full_name: string
  birth_date?: string | null
  mother_name?: string
  mother_phone?: string
  mother_email?: string
  father_name?: string
  father_phone?: string
  father_email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  assigned_professional_id?: string
  fee_value?: number
  address?: string
  phone?: string
  email?: string
  school?: string
  grade?: string
  diagnosis?: string
  referral_source?: string
  referral_doctor?: string
}

export interface Child {
  id: string
  full_name: string
  birth_date: string | null
  mother_name: string | null
  mother_phone: string | null
  mother_email: string | null
  father_name: string | null
  father_phone: string | null
  father_email: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  assigned_professional_id: string | null
  professional_name?: string
  fee_value: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ChildWithProfessional extends Child {
  professional?: { full_name: string } | null
}

/**
 * Create a new child
 * @param data - The child data
 * @returns Success status and the created child
 */
export async function createChild(
  data: CreateChildData
): Promise<{ success: boolean; data?: Child; error?: string }> {
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('No tiene permisos para realizar esta acción')
    }

    // Get current module fee if not provided
    let feeValue = data.fee_value
    if (feeValue === undefined) {
      const { data: currentModule } = await supabase
        .from('module_values')
        .select('fee_value')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      feeValue = currentModule?.fee_value || 0
    }

    // Insert the child
    const { data: child, error: insertError } = await supabase
      .from('children')
      .insert({
        full_name: data.full_name.trim(),
        birth_date: data.birth_date || null,
        mother_name: data.mother_name?.trim() || null,
        mother_phone: data.mother_phone?.trim() || null,
        mother_email: data.mother_email?.trim() || null,
        father_name: data.father_name?.trim() || null,
        father_phone: data.father_phone?.trim() || null,
        father_email: data.father_email?.trim() || null,
        emergency_contact_name: data.emergency_contact_name?.trim() || null,
        emergency_contact_phone: data.emergency_contact_phone?.trim() || null,
        assigned_professional_id: data.assigned_professional_id || null,
        fee_value: feeValue,
        address: data.address?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        school: data.school?.trim() || null,
        grade: data.grade?.trim() || null,
        diagnosis: data.diagnosis?.trim() || null,
        referral_source: data.referral_source?.trim() || null,
        referral_doctor: data.referral_doctor?.trim() || null,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Error al crear el niño: ${insertError.message}`)
    }

    revalidatePath('/admin/ninos')
    revalidatePath('/admin')

    return {
      success: true,
      data: child,
    }
  } catch (error) {
    console.error('Error creating child:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el niño',
    }
  }
}

/**
 * Get all children with their assigned professional
 * @param includeInactive - Whether to include inactive children
 * @returns List of children
 */
export async function getChildren(
  includeInactive: boolean = false
): Promise<{ success: boolean; data?: Child[]; error?: string }> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('children')
      .select(`
        *,
        professional:assigned_professional_id(full_name)
      `)
      .order('full_name')

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener los niños: ${error.message}`)
    }

    // Transform data to include professional_name
    const transformedData = (data as ChildWithProfessional[])?.map((child) => ({
      ...child,
      professional_name: child.professional?.full_name || null,
    })) || []

    return {
      success: true,
      data: transformedData,
    }
  } catch (error) {
    console.error('Error fetching children:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los niños',
    }
  }
}

/**
 * Get a single child by ID
 * @param id - The child ID
 * @returns The child data
 */
export async function getChildById(
  id: string
): Promise<{ success: boolean; data?: Child; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('children')
      .select(`
        *,
        professional:assigned_professional_id(full_name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error al obtener el niño: ${error.message}`)
    }

    const transformedData = {
      ...data,
      professional_name: data.professional?.full_name || null,
    }

    return {
      success: true,
      data: transformedData,
    }
  } catch (error) {
    console.error('Error fetching child:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el niño',
    }
  }
}

/**
 * Update a child
 * @param id - The child ID
 * @param data - The updated child data
 * @returns Success status
 */
export async function updateChild(
  id: string,
  data: Partial<CreateChildData>
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('No tiene permisos para realizar esta acción')
    }

    // Build update object with only provided fields
    const updateData: Record<string, string | boolean | number | null> = {}
    
    if (data.full_name !== undefined) updateData.full_name = data.full_name.trim()
    if (data.birth_date !== undefined) updateData.birth_date = data.birth_date
    if (data.mother_name !== undefined) updateData.mother_name = data.mother_name?.trim() || null
    if (data.mother_phone !== undefined) updateData.mother_phone = data.mother_phone?.trim() || null
    if (data.mother_email !== undefined) updateData.mother_email = data.mother_email?.trim() || null
    if (data.father_name !== undefined) updateData.father_name = data.father_name?.trim() || null
    if (data.father_phone !== undefined) updateData.father_phone = data.father_phone?.trim() || null
    if (data.father_email !== undefined) updateData.father_email = data.father_email?.trim() || null
    if (data.emergency_contact_name !== undefined) updateData.emergency_contact_name = data.emergency_contact_name?.trim() || null
    if (data.emergency_contact_phone !== undefined) updateData.emergency_contact_phone = data.emergency_contact_phone?.trim() || null
    if (data.assigned_professional_id !== undefined) updateData.assigned_professional_id = data.assigned_professional_id || null
    if (data.fee_value !== undefined) updateData.fee_value = data.fee_value
    if (data.address !== undefined) updateData.address = data.address?.trim() || null
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null
    if (data.email !== undefined) updateData.email = data.email?.trim() || null
    if (data.school !== undefined) updateData.school = data.school?.trim() || null
    if (data.grade !== undefined) updateData.grade = data.grade?.trim() || null
    if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis?.trim() || null
    if (data.referral_source !== undefined) updateData.referral_source = data.referral_source?.trim() || null
    if (data.referral_doctor !== undefined) updateData.referral_doctor = data.referral_doctor?.trim() || null
    
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('children')
      .update(updateData)
      .eq('id', id)

    if (error) {
      throw new Error(`Error al actualizar el niño: ${error.message}`)
    }

    revalidatePath('/admin/ninos')
    revalidatePath('/admin')
    revalidatePath(`/admin/ninos/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating child:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el niño',
    }
  }
}

/**
 * Soft delete a child (mark as inactive)
 * @param id - The child ID
 * @param reason - Optional reason for discharge
 * @returns Success status
 */
export async function deleteChild(
  id: string,
  reason?: string
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('No tiene permisos para realizar esta acción')
    }

    const { error } = await supabase
      .from('children')
      .update({
        is_active: false,
        discharge_date: new Date().toISOString().split('T')[0],
        discharge_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Error al eliminar el niño: ${error.message}`)
    }

    revalidatePath('/admin/ninos')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error deleting child:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el niño',
    }
  }
}

/**
 * Reactivate a child
 * @param id - The child ID
 * @returns Success status
 */
export async function reactivateChild(
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('No tiene permisos para realizar esta acción')
    }

    const { error } = await supabase
      .from('children')
      .update({
        is_active: true,
        discharge_date: null,
        discharge_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Error al reactivar el niño: ${error.message}`)
    }

    revalidatePath('/admin/ninos')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error reactivating child:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reactivar el niño',
    }
  }
}
