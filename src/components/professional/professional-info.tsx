'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  Award,
  Calendar,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

interface ProfessionalInfoProps {
  professional: {
    email: string;
    full_name: string;
    phone: string | null;
    is_active: boolean;
    specialization: string | null;
    specialty?: string | null;
    license_number: string | null;
    password?: string | null;
    created_at: string;
  };
}

export function ProfessionalInfo({ professional }: ProfessionalInfoProps) {
  const [showPassword, setShowPassword] = useState(true);

  return (
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
  );
}
