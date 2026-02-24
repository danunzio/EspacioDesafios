'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Users, CheckCircle } from 'lucide-react';
import { VALUE_TYPES } from '@/lib/constants/modules';

interface AvailableChild {
  id: string;
  full_name: string;
  health_insurance: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
}

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableChildren: AvailableChild[];
  selectedPatients: string[];
  onSelectPatient: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onConfirm: () => void;
  loading: boolean;
  loadingAvailable: boolean;
}

export function AddPatientModal({
  isOpen,
  onClose,
  availableChildren,
  selectedPatients,
  onSelectPatient,
  searchQuery,
  onSearchChange,
  onConfirm,
  loading,
  loadingAvailable
}: AddPatientModalProps) {
  const filteredChildren = useMemo(() => {
    if (!searchQuery) return availableChildren;
    const search = searchQuery.toLowerCase();
    return availableChildren.filter(child =>
      child.full_name.toLowerCase().includes(search) ||
      child.guardian_name?.toLowerCase().includes(search)
    );
  }, [availableChildren, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#2D2A32]">Asignar Pacientes</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-[#6B6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input
              type="text"
              placeholder="Buscar paciente disponible..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none text-sm"
              autoFocus
            />
          </div>
          {selectedPatients.length > 0 && (
            <p className="mt-2 text-sm text-[#A38EC3] font-medium">
              {selectedPatients.length} paciente(s) seleccionado(s)
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingAvailable ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#A38EC3] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredChildren.length > 0 ? (
            <div className="space-y-1">
              {filteredChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onSelectPatient(child.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${selectedPatients.includes(child.id)
                      ? 'bg-[#A38EC3]/10 border-2 border-[#A38EC3]'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPatients.includes(child.id)
                        ? 'border-[#A38EC3] bg-[#A38EC3]'
                        : 'border-gray-300'
                      }`}>
                      {selectedPatients.includes(child.id) && (
                        <CheckCircle size={14} className="text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#2D2A32] truncate">{child.full_name}</p>
                      <p className="text-sm text-[#6B6570] truncate">
                        {child.health_insurance || 'Sin obra social'}
                        {child.guardian_name && ` • ${child.guardian_name}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#6B6570]">
              {searchQuery ? (
                <>
                  <Search size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay pacientes que coincidan</p>
                </>
              ) : (
                <>
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Todos los pacientes están asignados</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            disabled={selectedPatients.length === 0 || loading}
          >
            {selectedPatients.length > 0
              ? `Asignar ${selectedPatients.length} paciente(s)`
              : 'Seleccionar pacientes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
