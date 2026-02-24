'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-modal';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Settings,
  Filter,
  ChevronLeft
} from 'lucide-react';
import { VALUE_TYPES, valueTypeColors, valueTypeLabels } from '@/lib/constants/modules';

interface Child {
  id: string;
  full_name: string;
  birth_date: string | null;
  health_insurance: string | null;
  guardian_name: string;
  guardian_phone: string | null;
  is_active: boolean;
  modules: string[];
}

interface ProfessionalModule {
  id: string;
  value_type: 'nomenclatura' | 'modulos' | 'osde' | 'sesion';
  is_active: boolean;
}

interface AssignedPatientsProps {
  professionalId: string;
  children: Child[];
  modules: ProfessionalModule[];
  onRemovePatient: (childId: string, childName: string) => Promise<void>;
  onOpenModulesModal: (child: Child) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AssignedPatients({
  professionalId,
  children,
  modules: professionalModules,
  onRemovePatient,
  onOpenModulesModal,
  onOpenAddModal,
  searchQuery,
  onSearchChange
}: AssignedPatientsProps) {
  const router = useRouter();
  const confirm = useConfirm();

  const activeChildren = useMemo(() => children.filter(c => c.is_active), [children]);
  const inactiveChildren = useMemo(() => children.filter(c => !c.is_active), [children]);

  const filteredChildren = useMemo(() => {
    if (!searchQuery) return activeChildren;
    const search = searchQuery.toLowerCase();
    return activeChildren.filter(child =>
      child.full_name.toLowerCase().includes(search) ||
      child.guardian_name?.toLowerCase().includes(search) ||
      child.health_insurance?.toLowerCase().includes(search)
    );
  }, [activeChildren, searchQuery]);

  const handleRemove = async (childId: string, childName: string) => {
    const confirmed = await confirm({
      title: 'Desasignar paciente',
      message: `¿Desasignar a ${childName} de este profesional?`,
      confirmText: 'Desasignar',
      cancelText: 'Cancelar',
      variant: 'danger',
      icon: 'trash',
    });
    if (!confirmed) return;
    await onRemovePatient(childId, childName);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2D2A32] flex items-center gap-2">
          <Users className="text-[#A38EC3]" size={20} />
          Pacientes Asignados ({activeChildren.length})
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddModal}
        >
          <UserPlus size={16} className="mr-1" />
          Asignar Paciente
        </Button>
      </div>

      {activeChildren.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none text-sm"
            />
          </div>
        </div>
      )}

      {activeChildren.length > 0 ? (
        <div className="space-y-2">
          {filteredChildren.length > 0 ? (
            filteredChildren.map((child) => (
              <div
                key={child.id}
                className="p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer min-w-0"
                    onClick={() => router.push(`/admin/ninos/${child.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/admin/ninos/${child.id}`)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <p className="font-medium text-[#2D2A32] truncate">{child.full_name}</p>
                    <p className="text-sm text-[#6B6570] truncate">
                      {child.health_insurance || 'Sin obra social'}
                      {child.guardian_name && ` • ${child.guardian_name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onOpenModulesModal(child)}
                      className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                      title="Editar módulos"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => handleRemove(child.id, child.full_name)}
                      className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                      title="Desasignar paciente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[#6B6570] flex items-center gap-1">
                    <Filter size={12} />
                    Módulos:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {child.modules && child.modules.length > 0 ? (
                      child.modules.map(m => (
                        <span
                          key={m}
                          className="px-2.5 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: `${valueTypeColors[m] || '#A38EC3'}20`,
                            color: valueTypeColors[m] || '#A38EC3'
                          }}
                        >
                          {valueTypeLabels[m] || m}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin módulos</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-[#6B6570]">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No se encontraron pacientes con ese criterio</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 px-4">
          <div className="w-14 h-14 rounded-2xl bg-[#A38EC3]/10 flex items-center justify-center mx-auto mb-3">
            <Users size={26} className="text-[#A38EC3]/50" />
          </div>
          <p className="font-medium text-[#2D2A32] mb-1">Sin pacientes asignados</p>
          <p className="text-sm text-[#6B6570] mb-4">Asigna pacientes a este profesional para comenzar</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddModal}
          >
            <UserPlus size={16} className="mr-1" />
            Asignar primer paciente
          </Button>
        </div>
      )}

      {inactiveChildren.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <details className="group">
            <summary className="cursor-pointer text-sm text-[#6B6570] hover:text-[#2D2A32] flex items-center gap-2">
              <ChevronLeft size={16} className="transition-transform group-open:rotate-[-90deg]" />
              Pacientes inactivos ({inactiveChildren.length})
            </summary>
            <div className="mt-2 space-y-1">
              {inactiveChildren.map((child) => (
                <div
                  key={child.id}
                  className="p-2 bg-gray-50 rounded-lg opacity-60 text-sm"
                >
                  {child.full_name}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </Card>
  );
}
