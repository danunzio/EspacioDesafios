import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ConfiguracionClient } from './configuracion-client';

export default async function ConfiguracionPage() {
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

  if (!profile) {
    redirect('/login');
  }

  return (
    <ConfiguracionClient 
      profile={profile}
      userEmail={user.email || ''}
    />
  );
}
