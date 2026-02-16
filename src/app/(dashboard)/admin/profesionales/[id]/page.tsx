import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProfessionalDetailClient } from './professional-detail-client';

interface ProfessionalDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfessionalDetailPage({ params }: ProfessionalDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch professional data
  const { data: professional, error: profError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'professional')
    .single();

  if (profError || !professional) {
    notFound();
  }

  // Fetch assigned children from both sources
  const [directResult, relationResult] = await Promise.all([
    supabase
      .from('children')
      .select('*')
      .eq('assigned_professional_id', id)
      .order('full_name'),
    supabase
      .from('children_professionals')
      .select('child_id')
      .eq('professional_id', id)
  ]);

  let children: any[] = directResult.data || [];

  if (relationResult.data && relationResult.data.length > 0) {
    const relationChildIds = relationResult.data.map(r => r.child_id);
    const relationChildrenResult = await supabase
      .from('children')
      .select('*')
      .in('id', relationChildIds)
      .order('full_name');
    
    if (relationChildrenResult.data) {
      const map = new Map<string, any>();
      for (const child of [...children, ...relationChildrenResult.data]) {
        if (!map.has(child.id)) {
          map.set(child.id, child);
        }
      }
      children = Array.from(map.values());
    }
  }

  if (directResult.error) {
    console.error('Error fetching children:', directResult.error);
  }

  // Fetch professional modules configuration
  const { data: modules, error: modulesError } = await supabase
    .from('professional_modules')
    .select('*')
    .eq('professional_id', id)
    .order('value_type');

  if (modulesError && (modulesError as any)?.message) {
    console.error('Error fetching modules:', (modulesError as any).message);
  }

  // Fetch liquidation history
  const { data: liquidations, error: liqError } = await supabase
    .from('liquidations')
    .select('*')
    .eq('professional_id', id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(12);

  if (liqError) {
    console.error('Error fetching liquidations:', liqError);
  }

  return (
    <ProfessionalDetailClient
      professional={professional}
      children={children || []}
      modules={modules || []}
      liquidations={liquidations || []}
    />
  );
}
