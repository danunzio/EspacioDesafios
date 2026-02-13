import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface MonthlySession {
  id: string;
  professional_id: string;
  child_id: string;
  year: number;
  month: number;
  module_name: string;
  session_count: number;
  individual_sessions: number;
  group_sessions: number;
  observations: string | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string;
  updated_at: string;
  child?: {
    full_name: string;
    guardian_name: string;
  };
  module?: {
    base_value: number;
    description: string;
  };
}

export interface SessionInput {
  child_id: string;
  module_name: string;
  session_count: number;
  individual_sessions: number;
  group_sessions: number;
  observations?: string;
}

interface UseSessionsReturn {
  sessions: MonthlySession[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseSaveSessionsReturn {
  saveSessions: (sessions: SessionInput[]) => Promise<{ success: boolean; error?: string }>;
  saving: boolean;
  error: string | null;
}

/**
 * Hook to fetch monthly sessions for a professional
 * @param professionalId - The professional ID
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Object containing sessions array, loading state, error, and refetch function
 */
export function useSessions(
  professionalId: string | null,
  year: number,
  month: number
): UseSessionsReturn {
  const [sessions, setSessions] = useState<MonthlySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSessions = useCallback(async () => {
    if (!professionalId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('monthly_sessions')
        .select(`
          *,
          child:children(full_name, guardian_name),
          module:module_values(base_value, description)
        `)
        .eq('professional_id', professionalId)
        .eq('year', year)
        .eq('month', month)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error al cargar las sesiones. Por favor, intente nuevamente.'
      );
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [professionalId, year, month, supabase]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions
  };
}

/**
 * Hook to save multiple sessions
 * @returns Object containing save function, saving state, and error
 */
export function useSaveSessions(
  professionalId: string,
  year: number,
  month: number
): UseSaveSessionsReturn {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const saveSessions = useCallback(async (
    sessions: SessionInput[]
  ): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    setError(null);

    try {
      // Validate sessions
      if (!sessions || sessions.length === 0) {
        throw new Error('No hay sesiones para guardar');
      }

      // Prepare sessions for upsert
      const sessionsToUpsert = sessions.map(session => ({
        professional_id: professionalId,
        year,
        month,
        child_id: session.child_id,
        module_name: session.module_name,
        session_count: session.session_count || 0,
        individual_sessions: session.individual_sessions || 0,
        group_sessions: session.group_sessions || 0,
        observations: session.observations || null,
        is_confirmed: false
      }));

      // Perform upsert operation
      const { error: upsertError } = await supabase
        .from('monthly_sessions')
        .upsert(sessionsToUpsert, {
          onConflict: 'professional_id,child_id,year,month,module_name',
          ignoreDuplicates: false
        });

      if (upsertError) {
        throw upsertError;
      }

      return { success: true };
    } catch (err) {
      console.error('Error saving sessions:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al guardar las sesiones. Por favor, intente nuevamente.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [professionalId, year, month, supabase]);

  return {
    saveSessions,
    saving,
    error
  };
}

/**
 * Hook to confirm sessions for a month
 * @param professionalId - The professional ID
 * @param year - The year
 * @param month - The month
 * @returns Object containing confirm function and loading state
 */
export function useConfirmSessions(
  professionalId: string,
  year: number,
  month: number
) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const confirmSessions = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setConfirming(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Update all sessions for the month to confirmed
      const { error: updateError } = await supabase
        .from('monthly_sessions')
        .update({
          is_confirmed: true,
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.id
        })
        .eq('professional_id', professionalId)
        .eq('year', year)
        .eq('month', month);

      if (updateError) {
        throw updateError;
      }

      return { success: true };
    } catch (err) {
      console.error('Error confirming sessions:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al confirmar las sesiones. Por favor, intente nuevamente.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setConfirming(false);
    }
  }, [professionalId, year, month, supabase]);

  return {
    confirmSessions,
    confirming,
    error
  };
}

/**
 * Hook to delete a session
 * @returns Object containing delete function and loading state
 */
export function useDeleteSession() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const deleteSession = useCallback(async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
    setDeleting(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('monthly_sessions')
        .delete()
        .eq('id', sessionId);

      if (deleteError) {
        throw deleteError;
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting session:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al eliminar la sesión. Por favor, intente nuevamente.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setDeleting(false);
    }
  }, [supabase]);

  return {
    deleteSession,
    deleting,
    error
  };
}
