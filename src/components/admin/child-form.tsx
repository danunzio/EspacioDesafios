'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Baby, Calendar, Users, X, Save, AlertCircle } from 'lucide-react';

interface Professional {
  id: string;
  full_name: string;
}

interface ChildFormData {
  full_name: string;
  birth_date: string;
  parent_name: string;
  parent_phone: string;
  assigned_professional_id: string;
}

interface ChildFormProps {
  professionals: Professional[];
  initialData?: Partial<ChildFormData>;
  onSubmit: (data: ChildFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const initialFormData: ChildFormData = {
  full_name: '',
  birth_date: '',
  parent_name: '',
  parent_phone: '',
  assigned_professional_id: '',
};

export function ChildForm({
  professionals,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: ChildFormProps) {
  const [formData, setFormData] = useState<ChildFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ChildFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChildFormData, string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'La fecha no puede ser futura';
      }
    }

    if (!formData.parent_name.trim()) {
      newErrors.parent_name = 'El nombre del apoderado es requerido';
    }

    if (!formData.parent_phone.trim()) {
      newErrors.parent_phone = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s-]{8,}$/.test(formData.parent_phone)) {
      newErrors.parent_phone = 'Ingresa un teléfono válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ChildFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#A38EC3]/15 flex items-center justify-center">
            <Baby className="text-[#A38EC3]" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2D2A32]">
              {isEditing ? 'Editar Niño' : 'Nuevo Niño'}
            </h2>
            <p className="text-sm text-[#6B6570]">
              {isEditing
                ? 'Actualiza la información del niño'
                : 'Completa los datos del nuevo niño'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} className="text-[#6B6570]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#6B6570] uppercase tracking-wide flex items-center gap-2">
            <Baby size={16} />
            Datos del Niño
          </h3>

          <Input
            label="Nombre Completo"
            placeholder="Ej: Juan Pérez García"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            error={errors.full_name}
            required
          />

          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleChange('birth_date', e.target.value)}
            error={errors.birth_date}
            required
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#6B6570] uppercase tracking-wide flex items-center gap-2">
            <Users size={16} />
            Datos del Apoderado
          </h3>

          <Input
            label="Nombre del Apoderado"
            placeholder="Ej: María García"
            value={formData.parent_name}
            onChange={(e) => handleChange('parent_name', e.target.value)}
            error={errors.parent_name}
            required
          />

          <Input
            label="Teléfono de Contacto"
            placeholder="Ej: +56 9 1234 5678"
            value={formData.parent_phone}
            onChange={(e) => handleChange('parent_phone', e.target.value)}
            error={errors.parent_phone}
            required
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#6B6570] uppercase tracking-wide flex items-center gap-2">
            <Calendar size={16} />
            Asignación
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesional Asignado
            </label>
            <select
              value={formData.assigned_professional_id}
              onChange={(e) =>
                handleChange('assigned_professional_id', e.target.value)
              }
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              <option value="">Seleccionar profesional...</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle size={20} />
            <span className="text-sm">
              Por favor corrige los errores antes de continuar
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E8E5F0]">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isSubmitting}
          >
            <Save size={18} className="mr-2" />
            {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Niño'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
