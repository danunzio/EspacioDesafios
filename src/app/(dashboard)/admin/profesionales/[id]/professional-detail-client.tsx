'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  Baby,
  DollarSign,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Heart,
  Calendar,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/calculations';
import { MONTH_NAMES } from '@/types';
import {
  createOrUpdateProfessionalModule,
  deleteProfessionalModule,
  toggleProfessionalModule,
  getProfessionalModules
} from '@/lib/actions/values';
import { createClient } from '@/lib/supabase/client';

// Define locally since it cannot be imported from 'use server' files
const VALUE_TYPES = [
  { value: 'nomenclatura', label: 'Nomenclador' },
  { value: 'modulos', label: 'Módulos' },
  { value: 'osde', label: 'OSDE' },
  { value: 'sesion', label: 'Sesión Individual' }
] as const;

interface Professional {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  specialization: string | null;
  license_number: string | null;
  password?: string | null;
  created_at: string;
  updated_at: string;
}

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
  professional_id: string;
  value_type: 'nomenclatura' | 'modulos' | 'osde' | 'sesion';
  commission_percentage: number;
  is_active: boolean;
}

interface Liquidation {
  id: string;
  year: number;
  month: number;
  total_sessions: number;
  total_amount: number;
  professional_percentage: number;
  professional_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paid_at: string | null;
}

interface ProfessionalDetailClientProps {
  professional: Professional;
  children: Child[];
  modules: ProfessionalModule[];
  liquidations: Liquidation[];
}

const valueTypeIcons: Record<string, typeof FileText> = {
  nomenclatura: FileText,
  modulos: Briefcase,
  osde: Heart,
  sesion: Clock
};

const valueTypeColors: Record<string, string> = {
  nomenclatura: '#A38EC3',
  modulos: '#F4C2C2',
  osde: '#A8E6CF',
  sesion: '#F9E79F'
};

const valueTypeLabels: Record<string, string> = {
  nomenclatura: 'Nomenclador',
  modulos: 'Módulos',
  osde: 'OSDE',
  sesion: 'Sesión Individual'
};

export function ProfessionalDetailClient({
  professional,
  children,
  modules: initialModules,
  liquidations
}: ProfessionalDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [modules, setModules] = useState<ProfessionalModule[]>(initialModules);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [commissionPercentage, setCommissionPercentage] = useState<string>('25');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingChildModules, setEditingChildModules] = useState<string | null>(null);
  const [childModules, setChildModules] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);

  const activeChildren = children.filter(c => c.is_active);
  const inactiveChildren = children.filter(c => !c.is_active);

  const handleAddModule = async () => {
    if (!selectedType || !commissionPercentage) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await createOrUpdateProfessionalModule(
      professional.id,
      selectedType,
      parseFloat(commissionPercentage)
    );

    if (result.success) {
      // Refresh modules
      const modulesResult = await getProfessionalModules(professional.id);
      if (modulesResult.success && modulesResult.data) {
        setModules(modulesResult.data);
      }
      setIsAddingModule(false);
      setSelectedType('');
      setCommissionPercentage('25');
      setSuccess('Módulo agregado correctamente');
    } else {
      setError(result.error || 'Error al agregar el módulo');
    }

    setLoading(false);
  };

  const handleUpdateModule = async (moduleId: string) => {
    if (!commissionPercentage) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const moduleToUpdate = modules.find(m => m.id === moduleId);
    if (!moduleToUpdate) return;

    const result = await createOrUpdateProfessionalModule(
      professional.id,
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
      setSuccess('Porcentaje actualizado correctamente');
    } else {
      setError(result.error || 'Error al actualizar el módulo');
    }

    setLoading(false);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este módulo?')) return;

    setLoading(true);
    const result = await deleteProfessionalModule(moduleId);

    if (result.success) {
      setModules(modules.filter(m => m.id !== moduleId));
      setSuccess('Módulo eliminado correctamente');
    } else {
      setError(result.error || 'Error al eliminar el módulo');
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
    } else {
      setError(result.error || 'Error al cambiar el estado');
    }

    setLoading(false);
  };

  const availableTypes = VALUE_TYPES.filter(
    vt => !modules.some(m => m.value_type === vt.value)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Pagado</Badge>;
      case 'approved':
        return <Badge variant="warning">Aprobado</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelado</Badge>;
      default:
        return <Badge variant="warning">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/profesionales')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-[#6B6570]" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A32]">{professional.full_name}</h2>
          <p className="text-[#6B6570] mt-1">
            {professional.specialization || 'Sin especialidad'}
          </p>
        </div>
        <Badge
          variant={professional.is_active ? 'success' : 'default'}
          className="ml-auto"
        >
          {professional.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      {/* Professional Info Card */}
      <Card>
        <h3 className="text-lg font-semibold text-[#2D2A32] mb-4 flex items-center gap-2">
          <User className="text-[#A38EC3]" size={20} />
          Información del Profesional
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center">
              <Mail className="text-[#A38EC3]" size={18} />
            </div>
            <div>
              <p className="text-xs text-[#6B6570]">Email</p>
              <p className="text-sm font-medium text-[#2D2A32]">{professional.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center">
              <Phone className="text-[#A38EC3]" size={18} />
            </div>
            <div>
              <p className="text-xs text-[#6B6570]">Teléfono</p>
              <p className="text-sm font-medium text-[#2D2A32]">
                {professional.phone || 'No especificado'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center">
              <Award className="text-[#A38EC3]" size={18} />
            </div>
            <div>
              <p className="text-xs text-[#6B6570]">Licencia</p>
              <p className="text-sm font-medium text-[#2D2A32]">
                {professional.license_number || 'No especificada'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center">
              <Calendar className="text-[#A38EC3]" size={18} />
            </div>
            <div>
              <p className="text-xs text-[#6B6570]">Registro</p>
              <p className="text-sm font-medium text-[#2D2A32]">
                {new Date(professional.created_at).toLocaleDateString('es-CL')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center">
              <Lock className="text-[#A38EC3]" size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#6B6570]">Contraseña Asignada</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#2D2A32]">
                  {showPassword ? (professional.password || 'Sin registrar') : '••••••••'}
                </p>
                {professional.password && (
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-[#9A94A0]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modules Configuration */}
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
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl flex items-center gap-2">
            <CheckCircle size={18} />
            <span className="text-sm">{success}</span>
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A94A0]">%</span>
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
          <div className="space-y-3">
            {modules.map((module) => {
              const Icon = valueTypeIcons[module.value_type];
              const color = valueTypeColors[module.value_type];
              const isEditing = editingModule === module.id;

              return (
                <div
                  key={module.id}
                  className={`p-4 rounded-xl border-2 transition-all ${module.is_active
                    ? 'border-gray-100 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon size={20} style={{ color }} />
                      </div>
                      <div>
                        <p className="font-medium text-[#2D2A32]">
                          {valueTypeLabels[module.value_type]}
                        </p>
                        <p className="text-xs text-[#6B6570]">
                          {module.is_active ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            value={commissionPercentage}
                            onChange={(e) => setCommissionPercentage(e.target.value)}
                            className="w-24 px-3 py-1 rounded-lg border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none text-sm"
                            min="0"
                            max="100"
                            step="0.01"
                            autoFocus
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9A94A0] text-xs">%</span>
                        </div>
                        <button
                          onClick={() => handleUpdateModule(module.id)}
                          disabled={loading}
                          className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingModule(null);
                            setCommissionPercentage('25');
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color }}>
                            {module.commission_percentage}%
                          </p>
                          <p className="text-xs text-[#6B6570]">Comisión</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingModule(module.id);
                              setCommissionPercentage(module.commission_percentage.toString());
                            }}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleModule(module.id, module.is_active)}
                            className={`p-2 rounded-lg transition-colors ${module.is_active
                              ? 'hover:bg-yellow-50 text-yellow-600'
                              : 'hover:bg-green-50 text-green-600'
                              }`}
                            title={module.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {module.is_active ? <X size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
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
          <div className="text-center py-8 text-[#6B6570]">
            <Settings size={48} className="mx-auto mb-3 opacity-30" />
            <p>No hay módulos configurados</p>
            <p className="text-sm mt-1">Se usará el 25% por defecto para todas las liquidaciones</p>
          </div>
        )}
      </Card>

      {/* Assigned Children */}
      <Card>
        <h3 className="text-lg font-semibold text-[#2D2A32] mb-4 flex items-center gap-2">
          <Baby className="text-[#A38EC3]" size={20} />
          Pacientes Asignados ({activeChildren.length} activos)
        </h3>

        {activeChildren.length > 0 ? (
          <div className="space-y-3">
            {activeChildren.map((child) => {
              const isEditingModules = editingChildModules === child.id;
              const childModuleList = childModules[child.id] || child.modules || [];

              return (
                <div
                  key={child.id}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => router.push(`/admin/ninos/${child.id}`)}>
                      <p className="font-medium text-[#2D2A32]">{child.full_name}</p>
                      <p className="text-sm text-[#6B6570]">
                        {child.health_insurance || 'Sin obra social'} • {child.guardian_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditingModules ? (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            {VALUE_TYPES.filter(vt => modules.some(m => m.value_type === vt.value && m.is_active)).map(type => (
                              <label key={type.value} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={childModuleList.includes(type.value)}
                                  onChange={(e) => {
                                    const selected = e.target.checked
                                      ? [...childModuleList, type.value]
                                      : childModuleList.filter((m: string) => m !== type.value);
                                    setChildModules(prev => ({ ...prev, [child.id]: selected }));
                                  }}
                                  className="rounded border-gray-300 text-[#A38EC3]"
                                />
                                <span>{type.label}</span>
                              </label>
                            ))}
                          </div>
                          <button
                            onClick={async () => {
                              setLoading(true);
                              try {
                                const currentModules = childModules[child.id] || child.modules || [];

                                // First delete all existing relations for this child-professional
                                const { error: deleteError } = await supabase
                                  .from('children_professionals')
                                  .delete()
                                  .eq('child_id', child.id)
                                  .eq('professional_id', professional.id);

                                if (deleteError) {
                                  throw new Error('Delete error: ' + deleteError.message);
                                }

                                // Then insert new ones
                                if (currentModules.length > 0) {
                                  const inserts = currentModules.map(m => ({
                                    child_id: child.id,
                                    professional_id: professional.id,
                                    module_name: m
                                  }));
                                  const { error: insertError } = await supabase.from('children_professionals').insert(inserts);
                                  if (insertError) {
                                    throw new Error('Insert error: ' + insertError.message);
                                  }
                                }
                                setEditingChildModules(null);
                                setSuccess('Módulos actualizados correctamente');
                              } catch (err: any) {
                                console.error('Full error:', err);
                                setError('Error: ' + (err?.message || JSON.stringify(err)));
                              }
                              setLoading(false);
                            }}
                            className="p-1.5 hover:bg-green-50 text-green-600 rounded"
                            title="Guardar"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => setEditingChildModules(null)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-1 mr-2">
                            {childModuleList.length > 0 ? (
                              childModuleList.slice(0, 2).map(m => (
                                <span key={m} className="px-2 py-0.5 bg-[#A38EC3]/20 text-[#A38EC3] text-xs rounded-full">
                                  {valueTypeLabels[m] || m}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">Sin tipo</span>
                            )}
                            {childModuleList.length > 2 && (
                              <span className="text-xs text-gray-400">+{childModuleList.length - 2}</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingChildModules(child.id);
                              setChildModules(prev => ({ ...prev, [child.id]: child.modules || [] }));
                            }}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                            title="Editar módulos"
                          >
                            <Settings size={16} />
                          </button>
                          <ChevronLeft className="rotate-180 text-[#9A94A0]" size={20} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-[#6B6570]">
            <Baby size={48} className="mx-auto mb-3 opacity-30" />
            <p>No hay pacientes asignados</p>
          </div>
        )}

        {inactiveChildren.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-[#6B6570] mb-2">
              Pacientes inactivos ({inactiveChildren.length})
            </p>
            <div className="space-y-2">
              {inactiveChildren.map((child) => (
                <div
                  key={child.id}
                  className="p-3 bg-gray-50 rounded-xl opacity-60"
                >
                  <p className="font-medium text-[#2D2A32]">{child.full_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Liquidation History */}
      <Card>
        <h3 className="text-lg font-semibold text-[#2D2A32] mb-4 flex items-center gap-2">
          <DollarSign className="text-[#A38EC3]" size={20} />
          Historial de Liquidaciones
        </h3>

        {liquidations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E5F0]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B6570]">
                    Período
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#6B6570]">
                    Sesiones
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                    Total
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6570]">
                    Comisión
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-[#6B6570]">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {liquidations.map((liq) => (
                  <tr
                    key={liq.id}
                    className="border-b border-[#E8E5F0] last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-[#2D2A32]">
                      {MONTH_NAMES[liq.month - 1]} {liq.year}
                    </td>
                    <td className="py-3 px-4 text-center text-[#2D2A32]">
                      {liq.total_sessions}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-[#2D2A32]">
                      {formatCurrency(liq.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[#A38EC3] font-medium">
                        {liq.professional_percentage}%
                      </span>
                      <p className="text-xs text-[#6B6570]">
                        {formatCurrency(liq.professional_amount)}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(liq.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[#6B6570]">
            <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
            <p>No hay liquidaciones registradas</p>
          </div>
        )}
      </Card>
    </div>
  );
}
