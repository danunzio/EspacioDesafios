'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
  Baby,
  Phone,
  Mail,
  Calendar,
  Search,
  User,
  Shield,
} from 'lucide-react';

interface Child {
  id: string;
  full_name: string;
  birth_date: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  health_insurance?: string;
  is_active?: boolean;
}

// Icono de WhatsApp personalizado
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export default function ProfessionalChildrenPage() {
  const router = useRouter();
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadChildren = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Get direct children
        const directResult = await supabase
          .from('children')
          .select(
            'id, full_name, birth_date, guardian_name, guardian_phone, guardian_email, health_insurance, is_active'
          )
          .eq('assigned_professional_id', user.id);

        if (!isMounted) return;

        if (directResult.error) {
          throw directResult.error;
        }

        // Get relation children IDs
        const relationResult = await supabase
          .from('children_professionals')
          .select('child_id')
          .eq('professional_id', user.id);

        if (!isMounted) return;

        if (relationResult.error) {
          throw relationResult.error;
        }

        const directChildren: Child[] = (directResult.data || []).map((c) => ({
          id: c.id,
          full_name: c.full_name,
          birth_date: c.birth_date,
          guardian_name: c.guardian_name,
          guardian_phone: c.guardian_phone,
          guardian_email: c.guardian_email,
          health_insurance: c.health_insurance,
          is_active: c.is_active,
        }));

        const relationChildIds = (relationResult.data || []).map(r => r.child_id);

        let relationChildren: Child[] = [];
        if (relationChildIds.length > 0) {
          const relationChildrenResult = await supabase
            .from('children')
            .select('id, full_name, birth_date, guardian_name, guardian_phone, guardian_email, health_insurance, is_active')
            .in('id', relationChildIds);

          if (!isMounted) return;

          if (!relationChildrenResult.error && relationChildrenResult.data) {
            relationChildren = relationChildrenResult.data.map((c) => ({
              id: c.id,
              full_name: c.full_name,
              birth_date: c.birth_date,
              guardian_name: c.guardian_name,
              guardian_phone: c.guardian_phone,
              guardian_email: c.guardian_email,
              health_insurance: c.health_insurance,
              is_active: c.is_active,
            }));
          }
        }

        if (!isMounted) return;

        const map = new Map<string, Child>();

        for (const child of [...directChildren, ...relationChildren]) {
          if (!map.has(child.id)) {
            map.set(child.id, child);
          }
        }

        setChildren(Array.from(map.values()));
      } catch (err: unknown) {
        if (!isMounted) return;

        // Ignore AbortError - check both name and message
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isAbortError =
          (err instanceof Error && err.name === 'AbortError') ||
          errorMessage.includes('aborted') ||
          errorMessage.includes('abort');

        if (isAbortError) {
          return;
        }

        console.error('Error al cargar pacientes del profesional:', err);

        const message =
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar tus pacientes. Intenta nuevamente.';
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChildren();

    return () => {
      isMounted = false;
    };
  }, [supabase, router]);

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const matchesSearch =
        child.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.guardian_name || child.parent_name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus = showInactive || child.is_active !== false;
      return matchesSearch && matchesStatus;
    });
  }, [children, searchQuery, showInactive]);

  const activeCount = children.filter((c) => c.is_active !== false).length;
  const inactiveCount = children.filter((c) => c.is_active === false).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6B6570]">Cargando pacientes...</p>
      </div>
    );
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string) => {
    const cleanNumber = cleanPhone(phone);
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2D2A32]">Mis Pacientes</h2>
        <p className="text-sm text-[#6B6570] mt-1">
          {activeCount} activos, {inactiveCount} inactivos
        </p>
      </div>

      <Card variant="soft" className="space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A94A0]"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[#6B6570]">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-[#A38EC3] focus:ring-[#A38EC3]"
          />
          Mostrar pacientes inactivos
        </label>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            {error}
          </div>
        )}
      </Card>

      {/* Lista de pacientes */}
      {filteredChildren.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredChildren.map((child) => (
            <Card
              key={child.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#A38EC3]/15 flex items-center justify-center flex-shrink-0">
                  <Baby className="text-[#A38EC3]" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#2D2A32] text-base">
                      {child.full_name}
                    </h3>
                    {child.is_active === false && (
                      <Badge variant="default" className="text-xs">Inactivo</Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {child.birth_date && (
                      <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                        <Calendar size={14} className="flex-shrink-0" />
                        {calculateAge(child.birth_date)} años
                      </span>
                    )}
                    {child.health_insurance && (
                      <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                        <Shield size={14} className="flex-shrink-0" />
                        {child.health_insurance}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E8E5F0]">
                    <p className="text-sm font-medium text-[#6B6570] mb-2 flex items-center gap-1.5">
                      <User size={14} className="flex-shrink-0" />
                      Responsable: {child.guardian_name || child.parent_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(child.guardian_phone || child.parent_phone) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCall((child.guardian_phone || child.parent_phone) as string)}
                            className="inline-flex items-center gap-1"
                          >
                            <Phone size={14} />
                            Llamar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWhatsApp((child.guardian_phone || child.parent_phone) as string)}
                            className="inline-flex items-center gap-1 border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <WhatsAppIcon size={14} />
                            WhatsApp
                          </Button>
                        </>
                      )}
                      {(child.guardian_email || child.parent_email) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${child.guardian_email || child.parent_email}`, '_self')}
                          className="inline-flex items-center gap-1"
                        >
                          <Mail size={14} />
                          Email
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Baby className="mx-auto mb-4 text-[#9A94A0]" size={48} />
          <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
            No se encontraron pacientes
          </h3>
          <p className="text-[#6B6570]">
            {searchQuery
              ? 'Intenta con otros términos de búsqueda'
              : 'No tienes pacientes asignados actualmente'}
          </p>
        </Card>
      )}

      <div className="text-sm text-[#6B6570] text-center">
        Mostrando {filteredChildren.length} de {children.length} pacientes
      </div>
    </div>
  );
}
