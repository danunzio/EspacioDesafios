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

  // Fetch assigned children from both sources with their modules
  const [directResult, relationResult] = await Promise.all([
    supabase
      .from('children')
      .select('*')
      .eq('assigned_professional_id', id)
      .order('full_name'),
    supabase
      .from('children_professionals')
      .select('child_id, module_name')
      .eq('professional_id', id)
  ]);

  const VALUE_TYPES = ['nomenclatura', 'modulos', 'osde', 'sesion'];

  const childModulesMap = new Map<string, string[]>();
  if (relationResult.data) {
    for (const r of relationResult.data) {
      const existing = childModulesMap.get(r.child_id) || [];
      if (r.module_name) {
        existing.push(r.module_name);
      }
      childModulesMap.set(r.child_id, existing);
    }
  }

interface ChildWithModules {
  id: string;
  full_name: string;
  birth_date: string | null;
  guardian_name: string;
  guardian_phone: string | null;
  health_insurance: string | null;
  is_active: boolean;
  modules: string[];
  [key: string]: unknown;
}

interface PostgrestError {
  message: string;
  code?: string;
}

  let children: ChildWithModules[] = directResult.data || [];

  if (relationResult.data && relationResult.data.length > 0) {
    const relationChildIds = [...new Set(relationResult.data.map(r => r.child_id))];
    const relationChildrenResult = await supabase
      .from('children')
      .select('*')
      .in('id', relationChildIds)
      .order('full_name');
    
    if (relationChildrenResult.data) {
      const map = new Map<string, ChildWithModules>();
      for (const child of [...children, ...relationChildrenResult.data]) {
        if (!map.has(child.id)) {
          const modules = childModulesMap.get(child.id) || VALUE_TYPES;
          child.modules = modules;
          map.set(child.id, child);
        }
      }
      children = Array.from(map.values());
    }
  } else {
    children = children.map(child => ({
      ...child,
      modules: VALUE_TYPES
    }));
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

  if (modulesError && (modulesError as PostgrestError)?.message) {
    console.error('Error fetching modules:', (modulesError as PostgrestError).message);
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
      assignedChildren={children}
      modules={modules || []}
      liquidations={liquidations || []}
    />
  );
}
