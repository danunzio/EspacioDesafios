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
              placeholder="Buscar por nombre o apoderado..."
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
                        <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                          <Phone size={14} className="flex-shrink-0" />
                          {child.guardian_phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(child.professional_names ?? []).map((name, index) => (
                        <span 
                          key={index}
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
