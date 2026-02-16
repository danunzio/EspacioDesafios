'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Settings, 
  LogOut, 
  User, 
  Mail, 
  Shield,
  ChevronRight,
  Smartphone
} from 'lucide-react';

interface ConfiguracionClientProps {
  profile: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  userEmail: string;
}

export function ConfiguracionClient({ profile, userEmail }: ConfiguracionClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const configSections = [
    {
      title: 'Perfil',
      items: [
        {
          icon: User,
          label: 'Nombre',
          value: profile.full_name,
          action: () => alert('Editar nombre - En desarrollo'),
        },
        {
          icon: Mail,
          label: 'Correo electrónico',
          value: userEmail,
          action: null,
        },
        {
          icon: Shield,
          label: 'Rol',
          value: profile.role === 'admin' ? 'Administrador' : 'Profesional',
          action: null,
        },
      ],
    },
    {
      title: 'Preferencias',
      items: [
        {
          icon: Smartphone,
          label: 'Versión de la app',
          value: '1.0.0',
          action: null,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#A38EC3]/15 mb-4">
          <Settings className="text-[#A38EC3]" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Configuración</h2>
        <p className="text-sm text-[#6B6570] mt-1">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Secciones de configuración */}
      <div className="space-y-4">
        {configSections.map((section) => (
          <Card key={section.title} className="overflow-hidden">
            <div className="px-4 py-3 bg-[#F8F7FF] border-b border-[#E8E5F0]">
              <h3 className="font-semibold text-[#2D2A32] text-sm uppercase tracking-wide">
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-[#E8E5F0]">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  onClick={item.action || undefined}
                  className={`flex items-center gap-3 px-4 py-4 ${
                    item.action ? 'hover:bg-gray-50 cursor-pointer' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-[#A38EC3]" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D2A32]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[#6B6570] truncate">
                      {item.value}
                    </p>
                  </div>
                  {item.action && (
                    <ChevronRight className="text-[#9A94A0]" size={20} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Botón de Cerrar Sesión */}
      <Card className="border-red-200">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <LogOut className="text-red-600" size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Cerrar sesión</p>
            <p className="text-xs text-red-400">
              {loading ? 'Cerrando sesión...' : 'Salir de la aplicación'}
            </p>
          </div>
        </button>
      </Card>

      {/* Información de la app */}
      <div className="text-center text-xs text-[#9A94A0] pt-4">
        <p>Espacio Desafíos v1.0.0</p>
        <p className="mt-1">© 2026 Todos los derechos reservados</p>
      </div>
    </div>
  );
}
