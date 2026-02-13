import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminProfessionalsClient } from './admin-professionals-client';

export default async function AdminProfessionalsPage() {
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

  // Fetch professionals from database - incluyendo todos, no solo los confirmados
  const { data: professionals, error: profError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'professional')
    .order('full_name', { ascending: true });

  if (profError) {
    console.error('Error fetching professionals:', profError);
  }

  // Transform data to match the expected format
  const formattedProfessionals = (professionals || []).map((prof) => ({
    id: prof.id,
    full_name: prof.full_name,
    email: prof.email,
    phone: prof.phone || '',
    specialty: prof.specialty || 'Sin especialidad',
    is_active: prof.is_active,
  }));

  return (
    <AdminProfessionalsClient 
      initialProfessionals={formattedProfessionals}
    />
  );
}
