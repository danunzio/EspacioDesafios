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
