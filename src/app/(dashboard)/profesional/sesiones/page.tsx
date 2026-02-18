'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Save,
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { MONTH_NAMES } from '@/types';
import { formatCurrency } from '@/lib/utils/calculations';
import { SessionRow } from '@/components/professional/session-row';
import { useAuth } from '@/lib/hooks/use-auth';

const VALUE_TYPE_LABELS: Record<string, string> = {
  nomenclatura: 'Nomenclador',
  modulos: 'Módulos',
  osde: 'OSDE',
  sesion: 'Sesión Individual'
};

interface Child {
  id: string;
  full_name: string;
  modules: string[];
}

interface SessionData {
  child_id: string;
  module_type: string;
  session_count: number;
  previous_month_count: number;
  commission_percentage: number;
}

interface ModuleValue {
  module_name: string;
  base_value: number;
}

interface ChildModule {
  child_id: string;
  module_name: string;
}

interface ProfessionalModuleConfig {
  value_type: string;
  commission_percentage: number;
}

export default function ProfessionalSessionsPage() {
  const supabase = createClient();
  const { user, profile, loading: authLoading } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [moduleValues, setModuleValues] = useState<ModuleValue[]>([]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (authLoading || !user || !profile) {
        return;
      }

      try {
        setLoading(true);

        // Get children with explicit modular assignments
        const childrenFromRelation = await supabase
          .from('children_professionals')
          .select('child_id, module_name')
          .eq('professional_id', user.id);

        if (!isMounted) return;
        if (childrenFromRelation.error) {
          throw childrenFromRelation.error;
        }

        // Get professional's active module configurations (commission percentages)
        const professionalModulesResponse = await supabase
          .from('professional_modules')
          .select('value_type, commission_percentage')
          .eq('professional_id', user.id)
          .eq('is_active', true);

        if (!isMounted) return;
        if (professionalModulesResponse.error) {
          throw professionalModulesResponse.error;
        }

        const professionalModulesMap = new Map<string, number>();
        for (const mod of (professionalModulesResponse.data || [])) {
          professionalModulesMap.set(mod.value_type, mod.commission_percentage);
        }

        // Build child modules map, filtering by the professional's active types
        const childModulesMap = new Map<string, string[]>();
        const assignedChildIdsSet = new Set<string>();

        for (const item of (childrenFromRelation.data || [])) {
          if (item.module_name && professionalModulesMap.has(item.module_name)) {
            const existing = childModulesMap.get(item.child_id) || [];
            existing.push(item.module_name);
            childModulesMap.set(item.child_id, existing);
            assignedChildIdsSet.add(item.child_id);
          }
        }

        const assignedChildIds = Array.from(assignedChildIdsSet);
        if (assignedChildIds.length === 0) {
          setChildren([]);
          setSessions([]);
          setLoading(false);
          return;
        }

        // Fetch details for the assigned children
        const childrenResponse = await supabase
          .from('children')
          .select('id, full_name')
          .in('id', assignedChildIds)
          .eq('is_active', true);

        if (!isMounted) return;
        if (childrenResponse.error) {
          throw childrenResponse.error;
        }

        const childrenData = (childrenResponse.data || []).map(child => ({
          ...child,
          modules: childModulesMap.get(child.id) || []
        }));

        setChildren(childrenData);


        const moduleValuesResponse = await supabase
          .from('module_values')
          .select('module_name, base_value')
          .eq('is_active', true);

        if (moduleValuesResponse.error) throw moduleValuesResponse.error;
        setModuleValues(moduleValuesResponse.data || []);

        const currentMonth = month;
        const currentYear = year;
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const [currentSessionsRes, previousSessionsRes] = await Promise.all([
          supabase.from('monthly_sessions').select('child_id, module_name, session_count')
            .eq('professional_id', user.id).eq('year', currentYear).eq('month', currentMonth),
          supabase.from('monthly_sessions').select('child_id, module_name, session_count')
            .eq('professional_id', user.id).eq('year', previousYear).eq('month', previousMonth)
        ]);

        const currentSessionsMap: Record<string, number> = {};
        (currentSessionsRes.data || []).forEach(s => currentSessionsMap[`${s.child_id}-${s.module_name}`] = s.session_count);

        const previousSessionsMap: Record<string, number> = {};
        (previousSessionsRes.data || []).forEach(s => previousSessionsMap[`${s.child_id}-${s.module_name}`] = s.session_count);

        const sessionsData: SessionData[] = [];
        childrenData.forEach((child) => {
          child.modules.forEach((module) => {
            const key = `${child.id}-${module}`;
            sessionsData.push({
              child_id: child.id,
              module_type: module,
              session_count: currentSessionsMap[key] || 0,
              previous_month_count: previousSessionsMap[key] || 0,
              commission_percentage: professionalModulesMap.get(module) || 25,
            });
          });
        });

        setSessions(sessionsData);
      } catch (error) {
        if (!isMounted) return;

        const errorMessage = error instanceof Error ? error.message : String(error);
        const isAbortError =
          (error instanceof Error && error.name === 'AbortError') ||
          errorMessage.includes('aborted') ||
          errorMessage.includes('abort');

        if (isAbortError) {
          return;
        }

        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, profile, authLoading, year, month, supabase]);

  const handleSessionChange = (childId: string, moduleType: string, count: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.child_id === childId && s.module_type === moduleType
          ? { ...s, session_count: count }
          : s
      )
    );
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const sessionsToUpsert = sessions.map((s) => ({
        professional_id: user.id,
        year,
        month,
        child_id: s.child_id,
        module_name: s.module_type,
        session_count: s.session_count,
        individual_sessions: s.session_count,
        group_sessions: 0,
        is_confirmed: false,
      }));

      if (sessionsToUpsert.length === 0) {
        return;
      }

      const { error: upsertError, status, statusText } = await supabase
        .from('monthly_sessions')
        .upsert(sessionsToUpsert, {
          onConflict: 'professional_id,child_id,year,month,module_name'
        });

      if (upsertError) {
        console.error('Supabase Upsert Error:', {
          message: upsertError.message,
          details: upsertError.details,
          hint: upsertError.hint,
          code: upsertError.code,
          status,
          statusText
        });
        throw new Error(upsertError.message);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving sessions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getChildName = (childId: string) => {
    return children.find((c) => c.id === childId)?.full_name || 'Paciente';
  };

  const getModuleValue = (moduleName: string) => {
    const module = moduleValues.find((m) => m.module_name === moduleName);
    return module?.base_value || 0;
  };

  const totalSessions = sessions.reduce((acc, s) => acc + s.session_count, 0);
  const estimatedBilling = sessions.reduce((acc, s) => {
    return acc + (s.session_count * getModuleValue(s.module_type));
  }, 0);
  const totalCommission = sessions.reduce((acc, s) => {
    const moduleValue = getModuleValue(s.module_type);
    return acc + (s.session_count * moduleValue * (s.commission_percentage / 100));
  }, 0);
  const netAmount = estimatedBilling - totalCommission;

  const hasChanges = sessions.some((s) => s.session_count > 0);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#A38EC3]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Cargar Sesiones</h2>
        <p className="text-[#6B6570] mt-1">
          Registra las sesiones realizadas este mes
        </p>
      </div>

      <Card variant="soft" className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-[#A38EC3]" size={24} />
          <h3 className="text-lg font-semibold text-[#2D2A32]">Período</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="text-[#A38EC3]" size={24} />
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Mis Pacientes
            </h3>
          </div>
          <Badge variant="default">
            {children.length} pacientes asignados
          </Badge>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-[#6B6570]">
              <Users className="mx-auto mb-2 text-gray-300" size={40} />
              <p>No tienes pacientes asignados actualmente.</p>
              <p className="text-sm mt-1">Contacta a administración para asignar pacientes.</p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <SessionRow
                key={`${session.child_id}-${session.module_type}`}
                childName={getChildName(session.child_id)}
                moduleType={VALUE_TYPE_LABELS[session.module_type] || session.module_type}
                commissionPercentage={session.commission_percentage}
                sessionCount={session.session_count}
                previousMonthCount={session.previous_month_count}
                onChange={(count) => handleSessionChange(session.child_id, session.module_type, count)}
              />
            ))
          )}
        </div>

        {saveSuccess && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={20} />
            <span className="text-sm">Sesiones guardadas correctamente</span>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="min-w-[200px]"
          >
            <Save size={18} className="mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Sesiones'}
          </Button>
        </div>
      </Card>

      {hasChanges && (
        <Card className="bg-gradient-to-r from-[#A38EC3]/10 to-[#F4C2C2]/10">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-[#A38EC3]" size={24} />
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Vista Previa de Facturación
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-[#A38EC3]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Total Sesiones
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">{totalSessions}</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-[#A38EC3]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Valor Módulo Promedio
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(
                  moduleValues.length > 0
                    ? moduleValues.reduce((acc, m) => acc + m.base_value, 0) / moduleValues.length
                    : 0
                )}
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-[#A8E6CF]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Facturación Total
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(estimatedBilling)}
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-[#8ED9B8]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Tu Pago (75%)
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(netAmount)}
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-[#F4C2C2]" size={16} />
                <span className="text-sm font-medium text-[#6B6570]">
                  Espacio Desafíos
                </span>
              </div>
              <p className="text-2xl font-bold text-[#2D2A32]">
                {formatCurrency(totalCommission)}
              </p>
              <p className="text-xs text-[#6B6570]">
                Retención clínica
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#F9E79F]/30 rounded-xl flex items-start gap-2">
            <AlertCircle className="text-[#D4B850] flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-[#6B6570]">
              Estos valores son estimados. El cálculo final dependerá de la
              liquidación realizada por administración.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
