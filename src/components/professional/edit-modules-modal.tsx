'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { VALUE_TYPES, valueTypeIcons, valueTypeColors } from '@/lib/constants/modules';

interface Child {
  id: string;
  full_name: string;
  modules: string[];
}

interface ProfessionalModule {
  id: string;
  value_type: 'nomenclatura' | 'modulos' | 'osde' | 'sesion';
  is_active: boolean;
}

interface EditModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  selectedModules: string[];
  onSelectModule: (module: string) => void;
  onConfirm: () => void;
  loading: boolean;
  professionalModules: ProfessionalModule[];
}

export function EditModulesModal({
  isOpen,
  onClose,
  child,
  selectedModules,
  onSelectModule,
  onConfirm,
  loading,
  professionalModules
}: EditModulesModalProps) {
  if (!isOpen || !child) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#2D2A32]">Módulos del Paciente</h3>
            <p className="text-sm text-[#6B6570]">{child.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-[#6B6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-[#6B6570] mb-3">
            Seleccioná los módulos que atenderá el profesional con este paciente:
          </p>

          <div className="space-y-2">
            {VALUE_TYPES.map((type) => {
              const color = valueTypeColors[type.value];
              const Icon = valueTypeIcons[type.value];
              const isSelected = selectedModules.includes(type.value);
              const isAvailable = professionalModules.some(m => m.value_type === type.value && m.is_active);

              return (
                <button
                  key={type.value}
                  onClick={() => {
                    if (!isAvailable) return;
                    onSelectModule(type.value);
                  }}
                  disabled={!isAvailable}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${!isAvailable
                      ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'border-2 border-[#A38EC3] bg-[#A38EC3]/10'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                        ? 'border-[#A38EC3] bg-[#A38EC3]'
                        : 'border-gray-300'
                      }`}
                  >
                    {isSelected && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <span className="font-medium text-[#2D2A32]">{type.label}</span>
                  {!isAvailable && (
                    <span className="ml-auto text-xs text-[#9CA3AF]">No configurado</span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedModules.length === 0 && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
              Seleccioná al menos un módulo para el paciente.
            </p>
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
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
