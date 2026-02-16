'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { 
  Settings, 
  DollarSign, 
  TrendingDown, 
  BarChart3, 
  ChevronRight,
  FileText,
  Briefcase,
  Heart,
  Clock,
  Zap,
  Flame,
  Droplets
} from 'lucide-react';

const menuItems = [
  {
    title: 'Configuración de Valores',
    description: 'Administra valores de nomenclatura, módulos, OSDE y sesiones',
    href: '/admin/valores',
    icon: Settings,
    color: '#A38EC3',
    subIcons: [FileText, Briefcase, Heart, Clock]
  },
  {
    title: 'Panel de Consumos',
    description: 'Registro de gastos operativos (luz, gas, fotocopias, etc.)',
    href: '/admin/consumos',
    icon: TrendingDown,
    color: '#E8A5A5',
    subIcons: [Zap, Flame, Droplets]
  },
  {
    title: 'Estadísticas',
    description: 'Reportes visuales de facturación y volumen de sesiones',
    href: '/admin/estadisticas',
    icon: BarChart3,
    color: '#8ED9B8',
    subIcons: []
  },
];

interface HealthInsurance {
  id: string;
  name: string;
  is_active: boolean;
}

export default function AdminMorePage() {
  const router = useRouter();
  const [healthInsurances, setHealthInsurances] = useState<HealthInsurance[]>([]);
  const [newInsuranceName, setNewInsuranceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const supabase = createClient();

  const fetchHealthInsurances = useCallback(async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('health_insurances')
        .select('id, name, is_active')
        .order('name');

      if (error) {
        throw error;
      }

      setHealthInsurances(data || []);
    } catch (err) {
      console.error('Error fetching health insurances:', err);
      setError('No se pudieron cargar las obras sociales. Intenta nuevamente.');
    }
  }, [supabase]);

  useEffect(() => {
    fetchHealthInsurances();
  }, [fetchHealthInsurances]);

  const handleAddInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newInsuranceName.trim();
    if (!trimmedName) {
      setError('Ingresa el nombre de la obra social');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase
        .from('health_insurances')
        .insert({
          name: trimmedName,
          is_active: true,
        })
        .select('id, name, is_active')
        .single();

      if (error) {
        throw error;
      }

      setHealthInsurances((prev) => {
        const exists = prev.some((item) => item.name.toLowerCase() === trimmedName.toLowerCase());
        if (exists) {
          return prev;
        }
        return [...prev, data as HealthInsurance].sort((a, b) => a.name.localeCompare(b.name));
      });

      setNewInsuranceName('');
      setSuccess('Obra social agregada correctamente');
    } catch (err: unknown) {
      console.error('Error adding health insurance:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo agregar la obra social. Intenta nuevamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (insurance: HealthInsurance) => {
    setEditingId(insurance.id);
    setEditingName(insurance.name);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (id: string) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setError('Ingresa el nombre de la obra social');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase
        .from('health_insurances')
        .update({ name: trimmedName })
        .eq('id', id)
        .select('id, name, is_active')
        .single();

      if (error) {
        throw error;
      }

      setHealthInsurances((prev) =>
        prev
          .map((item) => (item.id === id ? (data as HealthInsurance) : item))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      setSuccess('Obra social actualizada correctamente');
      setEditingId(null);
      setEditingName('');
    } catch (err: unknown) {
      console.error('Error updating health insurance:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la obra social. Intenta nuevamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (insurance: HealthInsurance) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase
        .from('health_insurances')
        .update({ is_active: !insurance.is_active })
        .eq('id', insurance.id)
        .select('id, name, is_active')
        .single();

      if (error) {
        throw error;
      }

      setHealthInsurances((prev) =>
        prev
          .map((item) => (item.id === insurance.id ? (data as HealthInsurance) : item))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      setSuccess(
        !insurance.is_active
          ? 'Obra social activada correctamente'
          : 'Obra social desactivada correctamente'
      );
    } catch (err: unknown) {
      console.error('Error toggling health insurance:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el estado de la obra social. Intenta nuevamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInsurance = async (id: string) => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de eliminar esta obra social? Los pacientes existentes conservarán el texto actual.'
    );
    if (!confirmDelete) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('health_insurances')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setHealthInsurances((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Obra social eliminada correctamente');
      if (editingId === id) {
        setEditingId(null);
        setEditingName('');
      }
    } catch (err: unknown) {
      console.error('Error deleting health insurance:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar la obra social. Intenta nuevamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Más Opciones</h2>
        <p className="text-[#6B6570] mt-1">
          Accede a todas las herramientas de administración
        </p>
      </div>

      <div className="space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.href}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(item.href)}
            >
              <div className="p-4 flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon size={28} style={{ color: item.color }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2D2A32] text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6B6570] mt-1">
                    {item.description}
                  </p>
                  
                  {item.subIcons.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      {item.subIcons.map((SubIcon, idx) => (
                        <div 
                          key={idx}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                        >
                          <SubIcon size={14} className="text-[#9A94A0]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <ChevronRight className="text-[#9A94A0] flex-shrink-0" size={24} />
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2D2A32]">
              Obras Sociales
            </h3>
            <p className="text-sm text-[#6B6570]">
              Agrega nuevas obras sociales para que aparezcan en el formulario de pacientes.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-xl text-green-600 text-xs">
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleAddInsurance} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                label="Nueva obra social"
                value={newInsuranceName}
                onChange={(e) => setNewInsuranceName(e.target.value)}
                placeholder="Ej: OSDE, Swiss Medical..."
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Agregar'}
              </Button>
            </div>
          </form>

          {healthInsurances.length > 0 && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {healthInsurances.map((insurance) => (
                <div
                  key={insurance.id}
                  className="flex items-center gap-2 justify-between"
                >
                  <div className="flex-1 min-w-0">
                    {editingId === insurance.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Nombre de la obra social"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-[#A38EC3]/10 text-[#2D2A32]">
                          {insurance.name}
                        </span>
                        {!insurance.is_active && (
                          <span className="text-xs text-[#9A94A0]">
                            Inactiva
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingId === insurance.id ? (
                      <>
                        <Button
                          size="xs"
                          variant="primary"
                          disabled={loading}
                          onClick={() => handleSaveEdit(insurance.id)}
                        >
                          Guardar
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={loading}
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={loading}
                          onClick={() => handleStartEdit(insurance)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="xs"
                          variant={insurance.is_active ? 'outline' : 'primary'}
                          disabled={loading}
                          onClick={() => handleToggleActive(insurance)}
                        >
                          {insurance.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={loading}
                          onClick={() => handleDeleteInsurance(insurance.id)}
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card variant="soft" className="bg-gradient-to-r from-[#A38EC3]/5 to-[#F4C2C2]/5">
        <div className="p-4">
          <h4 className="font-semibold text-[#2D2A32] mb-2">
            ¿Necesitas ayuda?
          </h4>
          <p className="text-sm text-[#6B6570]">
            Si tienes alguna duda sobre cómo usar estas herramientas, 
            contacta al administrador del sistema.
          </p>
        </div>
      </Card>
    </div>
  );
}
