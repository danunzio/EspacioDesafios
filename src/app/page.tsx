import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  try {
    console.log('HomePage: Creating Supabase client...');
    const supabase = await createClient();
    
    console.log('HomePage: Getting user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('HomePage: User result:', { user: user?.id, error: userError?.message });
    
    if (userError) {
      console.error('HomePage: User error:', userError);
      redirect('/login');
    }
    
    if (!user) {
      console.log('HomePage: No user found, redirecting to login');
      redirect('/login');
    }
    
    console.log('HomePage: Getting profile for user:', user.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    console.log('HomePage: Profile result:', { profile, error: profileError?.message });
    
    if (profileError) {
      console.error('HomePage: Profile error:', profileError);
      redirect('/login');
    }
    
    if (!profile) {
      console.log('HomePage: No profile found, redirecting to login');
      redirect('/login');
    }
    
    console.log('HomePage: User role:', profile.role);
    
    if (profile.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/profesional');
    }
  } catch (error) {
    console.error('HomePage: Unexpected error:', error);
    redirect('/login');
  }
}
