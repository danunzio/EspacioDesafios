import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminChildrenClient } from './admin-children-client';

export default async function AdminChildrenPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/profesional');
  }

  // Fetch real children data from database
  const [childrenResult, childrenProfsResult] = await Promise.all([
    supabase
      .from('children')
      .select(`*, profiles:assigned_professional_id(full_name)`)
      .order('full_name', { ascending: true }),
    supabase
      .from('children_professionals')
      .select('child_id, professional_id, profiles:professionals(full_name)')
  ]);

  const children = childrenResult.data || [];
  const childrenProfs = childrenProfsResult.data || [];

  if (childrenResult.error) {
    console.error('Error fetching children:', childrenResult.error);
  }

interface ChildProfessional {
  child_id: string;
  professional_id: string;
  profiles?: { full_name: string } | { full_name: string }[] | null;
}

  const childProfsMap = new Map<string, { ids: string[]; names: string[] }>();
  for (const cp of childrenProfs) {
    const existing = childProfsMap.get(cp.child_id) || { ids: [], names: [] };
    if (cp.professional_id && !existing.ids.includes(cp.professional_id)) {
      existing.ids.push(cp.professional_id);
    }
    const profiles = cp.profiles as { full_name: string } | { full_name: string }[] | null | undefined;
    const fullName = Array.isArray(profiles) ? profiles[0]?.full_name : profiles?.full_name;
    if (fullName && !existing.names.includes(fullName)) {
      existing.names.push(fullName);
    }
    childProfsMap.set(cp.child_id, existing);
  }

  // Fetch professionals for filter
  const { data: professionals, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'professional')
    .eq('is_active', true)
    .order('full_name');

  if (profError) {
    console.error('Error fetching professionals:', profError);
  }

  // Transform data to match the expected format
  const formattedChildren = (children || []).map((child) => {
    const childProfs = childProfsMap.get(child.id) || { ids: [], names: [] };

    // Include direct assigned professional if not already in the relation
    const allProfIds = child.assigned_professional_id
      ? [child.assigned_professional_id, ...childProfs.ids]
      : childProfs.ids;
    const uniqueProfIds = [...new Set(allProfIds)];

    return {
      id: child.id,
      full_name: child.full_name,
      birth_date: child.birth_date || '',
      guardian_name: child.guardian_name || child.mother_name || 'Sin responsable',
      guardian_phone: child.guardian_phone || child.mother_phone || '',
      guardian_email: child.guardian_email || child.mother_email || '',
      assigned_professional_id: child.assigned_professional_id,
      professional_name: child.profiles?.full_name || null,
      health_insurance: child.health_insurance || 'No especificada',
      is_active: child.is_active ?? true,
      assigned_professional_ids: uniqueProfIds,
      professional_names: childProfs.names,
    };
  });

  return (
    <AdminChildrenClient
      initialChildren={formattedChildren}
      professionals={professionals || []}
    />
  );
}
