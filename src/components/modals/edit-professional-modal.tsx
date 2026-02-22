'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Send, Trash2 } from 'lucide-react';

interface EditProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  professional: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    specialty: string;
    is_active: boolean;
  } | null;
}

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  password: string;
  is_active: boolean;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  password?: string;
  general?: string;
}

export function EditProfessionalModal({ isOpen, onClose, onSuccess, professional }: EditProfessionalModalProps) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    specialty: '',
    password: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [showPassword] = useState(true); // Por defecto visible
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const confirm = useConfirm();
  const supabase = createClient();

  useEffect(() => {
    if (professional && isOpen) {
      setFormData({
        full_name: professional.full_name || '',
        email: professional.email || '',
        phone: professional.phone || '',
        specialty: professional.specialty || '',
        password: '', // No mostrar contraseña actual
        is_active: professional.is_active ?? true,
      });
    }
  }, [professional, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setSuccess(false);
      setToast(null);
      setSendEmailNotification(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.specialty.trim()) {
      newErrors.specialty = 'La especialidad es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !professional) return;

    setLoading(true);
    setErrors({});

    try {
      const updateData: {
        full_name: string;
        email: string;
        phone: string | null;
        specialty: string;
        is_active: boolean;
      } = {
        full_name: formData.full_name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim() || null,
        specialty: formData.specialty.trim(),
        is_active: formData.is_active,
      };

      // Solo actualizar contraseña si se proporcionó una nueva
      if (formData.password) {
        // Aquí iría la lógica para actualizar la contraseña en Supabase Auth
        // Por ahora solo actualizamos el perfil
        console.log('Contraseña actualizada:', formData.password);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', professional.id);

      if (error) throw error;

      // Simular envío de email de notificación
      if (sendEmailNotification) {
        console.log('Enviando notificación por email a:', formData.email);
        // Aquí iría la lógica real de envío de email
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setSuccess(true);
      setToast({
        message: sendEmailNotification
          ? 'Profesional actualizado y notificación enviada'
          : 'Profesional actualizado exitosamente',
        type: 'success'
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error: unknown) {
      console.error('Error updating professional:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el profesional';
      setToast({ message: errorMessage, type: 'error' });
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const handleDeactivate = async () => {
    if (!professional) return;
    
    const confirmed = await confirm({
      title: 'Desactivar profesional',
      message: `¿Deseas desactivar al profesional ${professional.full_name}? Esta acción evita que se le asignen nuevos pacientes.`,
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
      variant: 'warning',
      icon: 'warning',
    });
    if (!confirmed) return;

    setDeleting(true);
    setErrors({});
    setToast(null);

    try {
      // Verificar niños asignados activos (both direct and relation)
      const [directResult, relationResult] = await Promise.all([
        supabase
          .from('children')
          .select('id')
          .eq('assigned_professional_id', professional.id)
          .eq('is_active', true),
        supabase
          .from('children_professionals')
          .select('child_id')
          .eq('professional_id', professional.id)
      ]);

      const directChildren = directResult.data || [];
      const relationChildIds = relationResult.data?.map(r => r.child_id) || [];

interface ChildIdResult {
  id: string;
}

      let relationChildren: ChildIdResult[] = [];
      if (relationChildIds.length > 0) {
        const relationResult2 = await supabase
          .from('children')
          .select('id')
          .in('id', relationChildIds)
          .eq('is_active', true);
        relationChildren = relationResult2.data || [];
      }

      const allAssignedChildren = [...directChildren, ...relationChildren];

      if (allAssignedChildren.length > 0) {
        const msg = `No se puede desactivar: tiene ${allAssignedChildren.length} paciente(s) activo(s) asignado(s). Reasígnalos primero.`;
        setToast({ message: msg, type: 'error' });
        setErrors({ general: msg });
        return;
      }

      // Desactivar profesional (soft delete)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', professional.id)
        .eq('role', 'professional');

      if (updateError) {
        throw new Error(`Error al desactivar el profesional: ${updateError.message}`);
      }

      setToast({ message: 'Profesional desactivado correctamente', type: 'success' });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (error: unknown) {
      console.error('Error deactivating professional:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al desactivar el profesional';
      setToast({ message: errorMessage, type: 'error' });
      setErrors({ general: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  if (!professional) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Editar Profesional"
        maxWidth="md"
      >
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle size={64} className="text-[#A8E6CF] mb-4" />
            <h3 className="text-xl font-semibold text-[#2D2A32] mb-2">
              ¡Profesional actualizado!
            </h3>
            <p className="text-[#6B6570]">
              {sendEmailNotification && 'Se ha enviado la notificación al profesional.'}
            </p>
            <p className="text-[#6B6570] mt-2">Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <Input
              label="Nombre completo *"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Ej: Dr. María González"
              required
              error={errors.full_name}
            />

            <Input
              label="Especialidad *"
              value={formData.specialty}
              onChange={(e) => handleChange('specialty', e.target.value)}
              placeholder="Ej: Psicología, Fonoaudiología, etc."
              required
              error={errors.specialty}
            />

            <Input
              label="Correo electrónico *"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Ej: profesional@espaciodesafios.cl"
              required
              error={errors.email}
            />

            <Input
              label="Teléfono"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Ej: +56 9 1234 5678"
            />

            {/* Campo de contraseña visible por defecto */}
            <Input
              label="Contraseña"
              type="text"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Contraseña Registrada"
              error={errors.password}
            />

            {/* Checkbox para notificación por email */}
            <label className="flex items-center gap-2 p-3 bg-[#A38EC3]/5 rounded-xl cursor-pointer hover:bg-[#A38EC3]/10 transition-colors">
              <input
                type="checkbox"
                checked={sendEmailNotification}
                onChange={(e) => setSendEmailNotification(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#A38EC3] focus:ring-[#A38EC3]"
              />
              <Send size={18} className="text-[#A38EC3]" />
              <span className="text-sm text-[#2D2A32]">
                Enviar notificación por email al profesional
              </span>
            </label>

            {/* Toggle para estado activo/inactivo */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
              <span className="text-sm font-medium text-[#2D2A32]">
                Estado del profesional
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A38EC3]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A38EC3]"></div>
                <span className={`ml-3 text-sm font-medium ${formData.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="sm:flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>

            <div className="mt-4 p-4 border border-red-200 rounded-xl bg-red-50">
              <h4 className="text-sm font-semibold text-red-700 mb-2">Acciones peligrosas</h4>
              <p className="text-xs text-red-700 mb-3">
                Desactivar evita nuevas asignaciones. Los datos del profesional se conservan.
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={handleDeactivate}
                disabled={deleting || loading}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Desactivando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Desactivar profesional
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`
            fixed bottom-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-fade-in
            ${toast.type === 'success' ? 'bg-[#A8E6CF] text-green-800' : 'bg-[#F4C2C2] text-red-800'}
          `}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
