import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Child {
  id: string;
  full_name: string;
  birth_date: string | null;
  document_number: string | null;
  health_insurance: string | null;
  affiliate_number: string | null;
  diagnostic: string | null;
  guardian_name: string;
  guardian_phone: string | null;
  guardian_email: string | null;
  guardian_relationship: string | null;
  secondary_contact_name: string | null;
  secondary_contact_phone: string | null;
  address: string | null;
  city: string;
  state: string;
  country: string;
  assigned_professional_id: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  professional?: {
    full_name: string;
    email: string;
  };
}

interface UseChildrenReturn {
  children: Child[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch children data
 * @param professionalId - Optional professional ID to filter children by assigned professional
 * @returns Object containing children array, loading state, error, and refetch function
 */
export function useChildren(professionalId?: string): UseChildrenReturn {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('children')
        .select(`
          *,
          professional:profiles(full_name, email)
        `)
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      // Filter by professional if provided
      if (professionalId) {
        query = query.eq('assigned_professional_id', professionalId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setChildren(data || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error al cargar los niños. Por favor, intente nuevamente.'
      );
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [professionalId, supabase]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  return {
    children,
    loading,
    error,
    refetch: fetchChildren
  };
}

/**
 * Hook to fetch a single child by ID
 * @param childId - The child ID to fetch
 * @returns Object containing child data, loading state, error, and refetch function
 */
export function useChild(childId: string | null) {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchChild = useCallback(async () => {
    if (!childId) {
      setChild(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('children')
        .select(`
          *,
          professional:profiles(full_name, email)
        `)
        .eq('id', childId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setChild(data);
    } catch (err) {
      console.error('Error fetching child:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error al cargar el niño. Por favor, intente nuevamente.'
      );
      setChild(null);
    } finally {
      setLoading(false);
    }
  }, [childId, supabase]);

  useEffect(() => {
    fetchChild();
  }, [fetchChild]);

  return {
    child,
    loading,
    error,
    refetch: fetchChild
  };
}

/**
 * Hook to search children by name
 * @param searchTerm - The search term to filter by
 * @param professionalId - Optional professional ID to filter by
 * @returns Object containing filtered children, loading state, and error
 */
export function useChildrenSearch(searchTerm: string, professionalId?: string) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const searchChildren = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setChildren([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('children')
          .select(`
            *,
            professional:profiles(full_name, email)
          `)
          .ilike('full_name', `%${searchTerm}%`)
          .eq('is_active', true)
          .order('full_name', { ascending: true })
          .limit(20);

        if (professionalId) {
          query = query.eq('assigned_professional_id', professionalId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setChildren(data || []);
      } catch (err) {
        console.error('Error searching children:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Error al buscar niños. Por favor, intente nuevamente.'
        );
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchChildren, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, professionalId, supabase]);

  return { children, loading, error };
}
