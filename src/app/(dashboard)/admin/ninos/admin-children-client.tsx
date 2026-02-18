'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddChildModal } from '@/components/modals/add-child-modal';
import { EditChildModal } from '@/components/modals/edit-child-modal';
import {
  Baby,
  Plus,
  Pencil,
  Search,
  Filter,
  Users,
  Phone,
  Mail,
  Calendar,
  Shield,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Icono de WhatsApp personalizado
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-green-500"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface Child {
  id: string;
  full_name: string;
  birth_date: string | null;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  health_insurance: string;
  assigned_professional_id: string | null;
  is_active: boolean;
}

interface ChildWithProfessional extends Child {
  assigned_professional_ids: string[];
  professional_names: string[];
}

interface Professional {
  id: string;
  full_name: string;
}

interface AdminChildrenClientProps {
  initialChildren: ChildWithProfessional[];
  professionals: Professional[];
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function AdminChildrenClient({ initialChildren, professionals }: AdminChildrenClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [children, setChildren] = useState<ChildWithProfessional[]>(initialChildren);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>(professionals);

  const supabase = createClient();

  // Fetch children with their professionals
  const fetchChildrenWithProfessionals = useCallback(async () => {
    try {
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select(`
          *,
          children_professionals(professional_id)
        `)
        .order('full_name');

      if (childrenError) throw childrenError;

      // Get all professional IDs
      const allProfIds = new Set<string>();
      childrenData?.forEach(child => {
        child.children_professionals?.forEach((cp: { professional_id: string }) => {
          allProfIds.add(cp.professional_id);
        });
        if (child.assigned_professional_id) {
          allProfIds.add(child.assigned_professional_id);
        }
      });

      // Fetch professional names
      const { data: profsData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(allProfIds));

      const profMap = new Map(profsData?.map(p => [p.id, p.full_name]) || []);

      // Transform data
      const transformedChildren = childrenData?.map(child => {
        const profIds = child.children_professionals?.map((cp: { professional_id: string }) => cp.professional_id) || [];
        // Add primary professional if not in the list
        if (child.assigned_professional_id && !profIds.includes(child.assigned_professional_id)) {
          profIds.push(child.assigned_professional_id);
        }

        return {
          ...child,
          assigned_professional_ids: profIds,
          professional_names: profIds.map((id: string) => profMap.get(id) || 'Desconocido'),
        };
      }) || [];

      setChildren(transformedChildren);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchChildrenWithProfessionals();
  }, [fetchChildrenWithProfessionals]);

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const matchesSearch =
        child.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.guardian_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProfessional =
        selectedProfessional === 'all' ||
        child.assigned_professional_ids.includes(selectedProfessional);
      return matchesSearch && matchesProfessional;
    });
  }, [children, searchQuery, selectedProfessional]);

  const handleDelete = (childId: string) => {
    if (confirm('¿Estás seguro de eliminar este paciente?')) {
      setChildren((prev) => prev.filter((c) => c.id !== childId));
    }
  };

  const handleEdit = (child: ChildWithProfessional) => {
    setSelectedChild(child);
    setIsEditModalOpen(true);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleSuccess = () => {
    fetchChildrenWithProfessionals();
    window.location.reload();
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2D2A32]">Pacientes</h2>
        <p className="text-sm text-[#6B6570] mt-1">
          Gestiona los pacientes registrados
        </p>
      </div>

      {/* Botón Nuevo Paciente */}
      <Button
        variant="primary"
        onClick={() => setIsAddModalOpen(true)}
        className="w-full"
      >
        <Plus size={18} className="mr-2" />
        Nuevo Paciente
      </Button>

      {/* Filtros */}
      <Card variant="soft" className="space-y-3">
        <div className="flex flex-col gap-2">
          <div className="flex-1 relative">
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
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#9A94A0] flex-shrink-0" />
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              <option value="all">Todos los profesionales</option>
              {allProfessionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Pacientes */}
      {filteredChildren.length > 0 ? (
        <div className="space-y-3">
          {filteredChildren.map((child) => (
            <Card
              key={child.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleEdit(child)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#A38EC3]/15 flex items-center justify-center flex-shrink-0">
                    <Baby className="text-[#A38EC3]" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#2D2A32] text-base">
                          {child.full_name}
                        </h3>
                        <Badge variant={child.is_active ? 'success' : 'default'} className="text-xs">
                          {child.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(child)
                        }}
                        className="font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#A38EC3] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-xl sm:rounded-[16px]"
                      >
                        <Pencil size={16} className="mr-1" />
                        Editar
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      {child.birth_date && (
                        <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                          <Calendar size={14} className="flex-shrink-0" />
                          {calculateAge(child.birth_date)} años
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                        <Shield size={14} className="flex-shrink-0" />
                        {child.health_insurance}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                        <Users size={14} className="flex-shrink-0" />
                        <span className="truncate">{child.guardian_name}</span>
                      </span>
                      {child.guardian_phone && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${child.guardian_phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-sm text-[#6B6570] hover:text-[#A38EC3] transition-colors"
                          >
                            <Phone size={14} className="flex-shrink-0" />
                            <span>{child.guardian_phone}</span>
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(child.guardian_phone);
                            }}
                            className="p-1 hover:bg-green-50 rounded-full transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <WhatsAppIcon size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(child.professional_names ?? []).map((name, index) => (
                        <span
                          key={`${name}-${index}`}
                          className="text-xs px-2 py-1 bg-[#A38EC3]/10 text-[#A38EC3] rounded-full"
                        >
                          {name}
                        </span>
                      ))}
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
          <p className="text-[#6B6570] mb-4">
            {searchQuery || selectedProfessional !== 'all'
              ? 'Intenta con otros filtros de búsqueda'
              : 'Comienza agregando tu primer paciente a la clínica'}
          </p>
          {!searchQuery && selectedProfessional === 'all' && (
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              Agregar Paciente
            </Button>
          )}
        </Card>
      )}

      <div className="text-sm text-[#6B6570] text-center">
        Mostrando {filteredChildren.length} de {children.length} pacientes
      </div>

      <AddChildModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditChildModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        child={selectedChild}
      />
    </div>
  );
}
