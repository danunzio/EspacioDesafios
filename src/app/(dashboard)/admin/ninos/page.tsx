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
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select(`
      *,
      profiles:assigned_professional_id(full_name)
    `)
    .order('full_name', { ascending: true });

  if (childrenError) {
    console.error('Error fetching children:', childrenError);
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
  const formattedChildren = (children || []).map((child) => ({
    id: child.id,
    full_name: child.full_name,
    birth_date: child.birth_date || '',
    parent_name: child.guardian_name || child.mother_name || 'Sin apoderado',
    parent_phone: child.guardian_phone || child.mother_phone || '',
    parent_email: child.guardian_email || child.mother_email || '',
    assigned_professional_id: child.assigned_professional_id,
    professional_name: child.profiles?.full_name || null,
    health_insurance: child.health_insurance || 'No especificada',
    is_active: child.is_active ?? true,
  }));

  return (
    <AdminChildrenClient 
      initialChildren={formattedChildren}
      professionals={professionals || []}
    />
  );
}
