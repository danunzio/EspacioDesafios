'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PaymentToClinic {
  id: string;
  professional_id: string;
  year: number;
  month: number;
  payment_date: string;
  payment_type: 'efectivo' | 'transferencia';
  amount: number;
  notes?: string;
  created_at: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
  verified_by?: string | null;
  verified_at?: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

/**
 * Create a payment to the clinic (Espacio Desafíos)
 * @param paymentData - The payment data
 * @returns Success status
 */
export async function createPaymentToClinic(
  paymentData: Omit<PaymentToClinic, 'id' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Insert payment
    const { error: paymentError } = await supabase
      .from('payments_to_clinic')
      .insert({
        professional_id: user.id,
        year: paymentData.year,
        month: paymentData.month,
        payment_date: paymentData.payment_date,
        payment_type: paymentData.payment_type,
        amount: paymentData.amount,
        notes: paymentData.notes || null,
        verification_status: 'pending'
      });

    if (paymentError) {
      throw new Error(`Error creating payment: ${paymentError.message}`);
    }

    // Get professional name for notification
    const { data: professional } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Find admin users to notify
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      // Create notifications for all admins
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        title: 'Nuevo pago recibido',
        message: `${professional?.full_name || 'Un profesional'} ha registrado un pago de ${paymentData.amount.toLocaleString('es-CL')} pesos (${paymentData.payment_type})`,
        type: 'success' as const,
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
        // Don't throw here, payment was successful
      }
    }

    revalidatePath('/profesional/facturacion');
    return { success: true };
  } catch (error) {
    console.error('Error creating payment to clinic:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrar el pago',
    };
  }
}

/**
 * Get payments to clinic for a professional
 * @param year - Optional year filter
 * @param month - Optional month filter
 * @returns List of payments
 */
export async function getPaymentsToClinic(
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: PaymentToClinic[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    let query = supabase
      .from('payments_to_clinic')
      .select('*')
      .eq('professional_id', user.id)
      .order('payment_date', { ascending: false });

    if (year !== undefined) {
      query = query.eq('year', year);
    }

    if (month !== undefined) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching payments: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Error fetching payments to clinic:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los pagos',
    };
  }
}

/**
 * Get all payments to clinic for admin review
 * @param year - Optional year filter
 * @param month - Optional month filter
 * @returns List of payments (all professionals)
 */
export async function getAllPaymentsToClinic(
  year?: number,
  month?: number
): Promise<{
  success: boolean;
  data?: (PaymentToClinic & { professional?: { full_name: string; email: string } })[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('payments_to_clinic')
      .select('*')
      .order('payment_date', { ascending: false });

    if (year !== undefined) {
      query = query.eq('year', year);
    }

    if (month !== undefined) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching payments: ${error.message}`);
    }

    const payments = data || [];

    const ids = Array.from(new Set(payments.map(p => p.professional_id).filter(Boolean)));
    let profilesMap = new Map<string, { full_name: string; email: string }>();
    if (ids.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ids);
      if (!profilesError && profilesData) {
        profilesMap = new Map(
          profilesData.map(p => [p.id, { full_name: p.full_name as string, email: p.email as string }])
        );
      }
    }

    const enriched: (PaymentToClinic & { professional?: { full_name: string; email: string } })[] = payments.map(p => ({
      ...p,
      professional: profilesMap.get(p.professional_id) || undefined
    }));

    return {
      success: true,
      data: enriched,
    };
  } catch (error) {
    console.error('Error fetching all payments to clinic:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los pagos',
    };
  }
}

/**
 * Review a payment to clinic: approve or reject
 * Notifies the professional with the result.
 */
export async function reviewPaymentToClinic(
  paymentId: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data: payment, error: fetchError } = await supabase
      .from('payments_to_clinic')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      throw new Error(fetchError?.message || 'Pago no encontrado');
    }

    const { error: updateError } = await supabase
      .from('payments_to_clinic')
      .update({
        verification_status: status,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (updateError) {
      throw new Error(`Error updating payment: ${updateError.message}`);
    }

    const { data: professional } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', payment.professional_id)
      .single();

    if (professional?.id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: professional.id,
          title: status === 'approved' ? 'Pago verificado' : 'Pago rechazado',
          message:
            status === 'approved'
              ? `Tu pago de ${payment.amount.toLocaleString('es-CL')} ha sido verificado por administración.`
              : `Tu pago de ${payment.amount.toLocaleString('es-CL')} ha sido rechazado por administración.`,
          type: status === 'approved' ? 'success' : 'error',
        });
    }

    revalidatePath('/admin/pagos');
    revalidatePath('/profesional/facturacion');
    return { success: true };
  } catch (error) {
    console.error('Error reviewing payment to clinic:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al revisar el pago',
    };
  }
}

/**
 * Create a notification for a specific user
 * @param userId - The user ID to notify
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 * @returns Success status
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'error' = 'info'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
    });

    if (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear notificación',
    };
  }
}
