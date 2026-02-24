'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-modal';
import {
  Settings,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { VALUE_TYPES, valueTypeIcons, valueTypeColors, valueTypeLabels } from '@/lib/constants/modules';
import {
  createOrUpdateProfessionalModule,
  deleteProfessionalModule,
  toggleProfessionalModule,
  getProfessionalModules
} from '@/lib/actions/values';

interface ProfessionalModule {
  id: string;
  professional_id: string;
  value_type: 'nomenclatura' | 'modulos' | 'osde' | 'sesion';
  commission_percentage: number;
  is_active: boolean;
}

interface ModulesConfigProps {
  professionalId: string;
  initialModules: ProfessionalModule[];
  error: string | null;
  success: string | null;
  onModuleChange: () => void;
}

export function ModulesConfig({
  professionalId,
  initialModules,
  error,
  success,
  onModuleChange
}: ModulesConfigProps) {
  const confirm = useConfirm();
  const [modules, setModules] = useState<ProfessionalModule[]>(initialModules);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [commissionPercentage, setCommissionPercentage] = useState<string>('25');
  const [loading, setLoading] = useState(false);

  const handleAddModule = async () => {
    if (!selectedType || !commissionPercentage) return;

    setLoading(true);
    const result = await createOrUpdateProfessionalModule(
      professionalId,
      selectedType,
      parseFloat(commissionPercentage)
    );

    if (result.success) {
      const modulesResult = await getProfessionalModules(professionalId);
      if (modulesResult.success && modulesResult.data) {
        setModules(modulesResult.data);
      }
      setIsAddingModule(false);
      setSelectedType('');
      setCommissionPercentage('25');
      onModuleChange();
    }
    setLoading(false);
  };

  const handleUpdateModule = async (moduleId: string) => {
    if (!commissionPercentage) return;

    setLoading(true);
    const moduleToUpdate = modules.find(m => m.id === moduleId);
    if (!moduleToUpdate) return;

    const result = await createOrUpdateProfessionalModule(
      professionalId,
      moduleToUpdate.value_type,
      parseFloat(commissionPercentage)
    );

    if (result.success) {
      setModules(modules.map(m =>
        m.id === moduleId
          ? { ...m, commission_percentage: parseFloat(commissionPercentage) }
          : m
      ));
      setEditingModule(null);
      onModuleChange();
    }
    setLoading(false);
  };

  const handleDeleteModule = async (moduleId: string) => {
    const confirmed = await confirm({
      title: 'Eliminar módulo',
      message: '¿Estás seguro de que deseas eliminar este módulo?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      icon: 'trash',
    });
    if (!confirmed) return;

    setLoading(true);
    const result = await deleteProfessionalModule(moduleId);

    if (result.success) {
      setModules(modules.filter(m => m.id !== moduleId));
      onModuleChange();
    }
    setLoading(false);
  };

  const handleToggleModule = async (moduleId: string, currentStatus: boolean) => {
    setLoading(true);
    const result = await toggleProfessionalModule(moduleId, !currentStatus);

    if (result.success) {
      setModules(modules.map(m =>
        m.id === moduleId
          ? { ...m, is_active: !currentStatus }
          : m
      ));
    }
    setLoading(false);
  };

  const availableTypes = VALUE_TYPES.filter(
    vt => !modules.some(m => m.value_type === vt.value)
  );

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2D2A32] flex items-center gap-2">
          <Settings className="text-[#A38EC3]" size={20} />
          Configuración de Módulos y Comisiones
        </h3>
        {!isAddingModule && availableTypes.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingModule(true)}
          >
            <Plus size={16} className="mr-1" />
            Agregar Módulo
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm font-medium">Error</span>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {isAddingModule && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-[#2D2A32] mb-3">Nuevo Módulo</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              <option value="">Seleccionar tipo...</option>
              {availableTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                type="number"
                placeholder="Porcentaje de comisión"
                value={commissionPercentage}
                onChange={(e) => setCommissionPercentage(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
                min="0"
                max="100"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C]">%</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddModule}
              disabled={!selectedType || !commissionPercentage || loading}
            >
              <Save size={16} className="mr-1" />
              Guardar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingModule(false);
                setSelectedType('');
                setCommissionPercentage('25');
              }}
            >
              <X size={16} className="mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {modules.length > 0 ? (
        <div className="space-y-2">
          {modules.map((module) => {
            const Icon = valueTypeIcons[module.value_type];
            const color = valueTypeColors[module.value_type];
            const isEditing = editingModule === module.id;

            return (
              <div
                key={module.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all ${module.is_active
                    ? 'border-gray-100 bg-white shadow-sm'
                    : 'border-dashed border-gray-200 bg-gray-50/60'
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}25` }}
                    >
                      <Icon size={17} style={{ color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${module.is_active ? 'text-[#2D2A32]' : 'text-[#9CA3AF]'}`}>
                          {valueTypeLabels[module.value_type]}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${module.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                          }`}>
                          {module.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <input
                          type="number"
                          value={commissionPercentage}
                          onChange={(e) => setCommissionPercentage(e.target.value)}
                          className="w-20 px-2 py-1.5 pr-6 rounded-lg border-2 border-[#A38EC3] focus:outline-none text-sm font-medium text-right"
                          min="0"
                          max="100"
                          step="0.01"
                          autoFocus
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#78716C] text-xs">%</span>
                      </div>
                      <button
                        onClick={() => handleUpdateModule(module.id)}
                        disabled={loading}
                        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Guardar"
                      >
                        <Save size={15} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingModule(null);
                          setCommissionPercentage('25');
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-1">
                        <p className="text-base font-bold leading-none" style={{ color: module.is_active ? color : '#9CA3AF' }}>
                          {module.commission_percentage}%
                        </p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">comisión</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => {
                            setEditingModule(module.id);
                            setCommissionPercentage(module.commission_percentage.toString());
                          }}
                          className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                          title="Editar comisión"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleModule(module.id, module.is_active)}
                          className={`p-1.5 rounded-lg transition-colors ${module.is_active
                              ? 'hover:bg-amber-50 text-amber-500'
                              : 'hover:bg-green-50 text-green-500'
                            }`}
                          title={module.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {module.is_active ? <X size={15} /> : <CheckCircle size={15} />}
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                          title="Eliminar módulo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 px-4">
          <div className="w-14 h-14 rounded-2xl bg-[#A38EC3]/10 flex items-center justify-center mx-auto mb-3">
            <Settings size={26} className="text-[#A38EC3]/50" />
          </div>
          <p className="font-medium text-[#2D2A32] mb-1">Sin módulos configurados</p>
          <p className="text-sm text-[#6B6570]">Se usará el 25% por defecto en las liquidaciones</p>
          {availableTypes.length > 0 && (
            <button
              onClick={() => setIsAddingModule(true)}
              className="mt-3 text-sm text-[#A38EC3] hover:text-[#7B6CA3] font-medium transition-colors"
            >
              + Agregar primer módulo
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
