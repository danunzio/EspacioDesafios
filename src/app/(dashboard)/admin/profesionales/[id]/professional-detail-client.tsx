'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConfirm } from '@/components/ui/confirm-modal';
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
  Lock,
  Search,
  UserPlus,
  Users,
  Filter
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
  specialty?: string | null;
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

interface AvailableChild {
  id: string;
  full_name: string;
  health_insurance: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
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
  assignedChildren: Child[];
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
  assignedChildren: children,
  modules: initialModules,
  liquidations
}: ProfessionalDetailClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const supabase = createClient();
  const [modules, setModules] = useState<ProfessionalModule[]>(initialModules);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [commissionPercentage, setCommissionPercentage] = useState<string>('25');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [availableChildren, setAvailableChildren] = useState<AvailableChild[]>([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedNewPatients, setSelectedNewPatients] = useState<string[]>([]);
  const [searchAssigned, setSearchAssigned] = useState('');
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [showModulesModal, setShowModulesModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (error) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setError(null), 5000);
    }
    return () => { if (errorTimerRef.current) clearTimeout(errorTimerRef.current); };
  }, [error]);

  useEffect(() => {
    if (success) {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(null), 4000);
    }
    return () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); };
  }, [success]);

  // Helper for friendly error messages
  const getFriendlyError = (rawError: string): string => {
    if (rawError.includes('duplicate key') || rawError.includes('unique constraint')) {
      return 'Ya existe una configuración con ese dato. Por favor verificá los módulos asignados.';
    }
    if (rawError.includes('foreign key')) {
      return 'No se puede completar la acción porque hay datos relacionados.';
    }
    if (rawError.includes('network') || rawError.includes('fetch')) {
      return 'Error de conexión. Verificá tu internet e intentá de nuevo.';
    }
    return 'Ocurrió un error inesperado. Intentá de nuevo.';
  };

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

  const filteredActiveChildren = useMemo(() => {
    if (!searchAssigned) return activeChildren;
    const search = searchAssigned.toLowerCase();
    return activeChildren.filter(child => 
      child.full_name.toLowerCase().includes(search) ||
      child.guardian_name?.toLowerCase().includes(search) ||
      child.health_insurance?.toLowerCase().includes(search)
    );
  }, [activeChildren, searchAssigned]);

  const fetchAvailableChildren = async () => {
    setLoadingAvailable(true);
    try {
      const { data: allChildren } = await supabase
        .from('children')
        .select('id, full_name, health_insurance, guardian_name, guardian_phone')
        .eq('is_active', true)
        .order('full_name');
      
      const { data: assignedRelations } = await supabase
        .from('children_professionals')
        .select('child_id')
        .eq('professional_id', professional.id);
      
      const { data: directAssigned } = await supabase
        .from('children')
        .select('id')
        .eq('assigned_professional_id', professional.id)
        .eq('is_active', true);

      const assignedIds = new Set([
        ...(assignedRelations?.map(r => r.child_id) || []),
        ...(directAssigned?.map(c => c.id) || [])
      ]);

      const available = (allChildren || []).filter(c => !assignedIds.has(c.id));
      setAvailableChildren(available);
    } catch (err) {
      console.error('Error fetching available children:', err);
    }
    setLoadingAvailable(false);
  };

  const handleAddPatients = async () => {
    if (selectedNewPatients.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const inserts = selectedNewPatients.flatMap(childId => 
        VALUE_TYPES.map(m => ({
          child_id: childId,
          professional_id: professional.id,
          module_name: m.value
        }))
      );

      const { error: insertError } = await supabase
        .from('children_professionals')
        .insert(inserts);

      if (insertError) throw new Error(insertError.message);
      
      setSuccess(`${selectedNewPatients.length} paciente(s) asignado(s) correctamente`);
      setShowAddPatientModal(false);
      setSelectedNewPatients([]);
      setSearchPatient('');
      router.refresh();
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      setError(getFriendlyError(rawMsg));
    }
    setLoading(false);
  };

  const handleRemovePatient = async (childId: string, childName: string) => {
    const confirmed = await confirm({
      title: 'Desasignar paciente',
      message: `¿Desasignar a ${childName} de este profesional?`,
      confirmText: 'Desasignar',
      cancelText: 'Cancelar',
      variant: 'danger',
      icon: 'trash',
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('children_professionals')
        .delete()
        .eq('child_id', childId)
        .eq('professional_id', professional.id);

      if (deleteError) throw new Error(deleteError.message);
      
      setSuccess('Paciente desasignado correctamente');
      router.refresh();
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      setError(getFriendlyError(rawMsg));
    }
    setLoading(false);
  };

  const handleSaveChildModules = async () => {
    if (!editingChild) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('children_professionals')
        .delete()
        .eq('child_id', editingChild.id)
        .eq('professional_id', professional.id);

      if (deleteError) throw new Error(deleteError.message);
      
      if (selectedModules.length > 0) {
        const inserts = selectedModules.map((m) => ({
          child_id: editingChild.id,
          professional_id: professional.id,
          module_name: m
        }));
        const { error: insertError } = await supabase
          .from('children_professionals')
          .insert(inserts);
        if (insertError) throw new Error(insertError.message);
      }
      
      setSuccess('Módulos actualizados correctamente');
      setShowModulesModal(false);
      setEditingChild(null);
      setSelectedModules([]);
      router.refresh();
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      setError(getFriendlyError(rawMsg));
    }
    setLoading(false);
  };

  const openModulesModal = (child: Child) => {
    setEditingChild(child);
    setSelectedModules(child.modules || []);
    setShowModulesModal(true);
  };

  const filteredAvailableChildren = useMemo(() => {
    if (!searchPatient) return availableChildren;
    const search = searchPatient.toLowerCase();
    return availableChildren.filter(child => 
      child.full_name.toLowerCase().includes(search) ||
      child.guardian_name?.toLowerCase().includes(search)
    );
  }, [availableChildren, searchPatient]);

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
            {professional.specialization || professional.specialty || 'Sin especialidad'}
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
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-[#78716C]"
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
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2 animate-fade-in">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm font-medium">Error</span>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-400">
              <X size={14} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto p-1 hover:bg-green-100 rounded-lg transition-colors text-green-400">
              <X size={14} />
            </button>
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
                          <p className={`font-medium text-sm ${module.is_active ? 'text-[#2D2A32]' : 'text-[#9CA3AF]'
                            }`}>
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
                            aria-label="Editar porcentaje de comisión"
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
                            aria-label={module.is_active ? 'Desactivar módulo' : 'Activar módulo'}
                          >
                            {module.is_active ? <X size={15} /> : <CheckCircle size={15} />}
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                            title="Eliminar módulo"
                            aria-label="Eliminar módulo"
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

      {/* Assigned Children */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2D2A32] flex items-center gap-2">
            <Users className="text-[#A38EC3]" size={20} />
            Pacientes Asignados ({activeChildren.length})
          </h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setShowAddPatientModal(true);
              fetchAvailableChildren();
            }}
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
                value={searchAssigned}
                onChange={(e) => setSearchAssigned(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none text-sm"
              />
            </div>
          </div>
        )}

        {activeChildren.length > 0 ? (
          <div className="space-y-2">
            {filteredActiveChildren.length > 0 ? (
              filteredActiveChildren.map((child) => (
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
                        onClick={() => openModulesModal(child)}
                        className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                        title="Editar módulos"
                      >
                        <Settings size={16} />
                      </button>
                      <button
                        onClick={() => handleRemovePatient(child.id, child.full_name)}
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
              onClick={() => {
                setShowAddPatientModal(true);
                fetchAvailableChildren();
              }}
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

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2D2A32]">Asignar Pacientes</h3>
              <button
                onClick={() => {
                  setShowAddPatientModal(false);
                  setSelectedNewPatients([]);
                  setSearchPatient('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-[#6B6570]" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <input
                  type="text"
                  placeholder="Buscar paciente disponible..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none text-sm"
                  autoFocus
                />
              </div>
              {selectedNewPatients.length > 0 && (
                <p className="mt-2 text-sm text-[#A38EC3] font-medium">
                  {selectedNewPatients.length} paciente(s) seleccionado(s)
                </p>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {loadingAvailable ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#A38EC3] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredAvailableChildren.length > 0 ? (
                <div className="space-y-1">
                  {filteredAvailableChildren.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setSelectedNewPatients(prev =>
                          prev.includes(child.id)
                            ? prev.filter(id => id !== child.id)
                            : [...prev, child.id]
                        );
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedNewPatients.includes(child.id)
                          ? 'bg-[#A38EC3]/10 border-2 border-[#A38EC3]'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedNewPatients.includes(child.id)
                            ? 'border-[#A38EC3] bg-[#A38EC3]'
                            : 'border-gray-300'
                        }`}>
                          {selectedNewPatients.includes(child.id) && (
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
                  {searchPatient ? (
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
                onClick={() => {
                  setShowAddPatientModal(false);
                  setSelectedNewPatients([]);
                  setSearchPatient('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleAddPatients}
                disabled={selectedNewPatients.length === 0 || loading}
              >
                {selectedNewPatients.length > 0
                  ? `Asignar ${selectedNewPatients.length} paciente(s)`
                  : 'Seleccionar pacientes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modules Modal */}
      {showModulesModal && editingChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#2D2A32]">Módulos del Paciente</h3>
                <p className="text-sm text-[#6B6570]">{editingChild.full_name}</p>
              </div>
              <button
                onClick={() => {
                  setShowModulesModal(false);
                  setEditingChild(null);
                  setSelectedModules([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-[#6B6570]" />
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
                  const isAvailable = modules.some(m => m.value_type === type.value && m.is_active);
                  
                  return (
                    <button
                      key={type.value}
                      onClick={() => {
                        if (!isAvailable) return;
                        setSelectedModules(prev =>
                          prev.includes(type.value)
                            ? prev.filter(m => m !== type.value)
                            : [...prev, type.value]
                        );
                      }}
                      disabled={!isAvailable}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                        !isAvailable
                          ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-2 border-[#A38EC3] bg-[#A38EC3]/10'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
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
                onClick={() => {
                  setShowModulesModal(false);
                  setEditingChild(null);
                  setSelectedModules([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSaveChildModules}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
