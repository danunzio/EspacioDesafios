'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Settings, 
  LogOut, 
  User, 
  Mail, 
  Smartphone
} from 'lucide-react';

interface ConfiguracionProfesionalClientProps {
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export default function ConfiguracionProfesionalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<ConfiguracionProfesionalClientProps['profile'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    loadProfile();
  }, [supabase, router]);

  const handleLogout = async () => {
    if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      return;
    }

    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Intenta nuevamente.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#6B6570]">Cargando...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#6B6570]">Error al cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#A38EC3]/15 mb-4">
          <Settings className="text-[#A38EC3]" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Configuración</h2>
        <p className="text-sm text-[#6B6570] mt-1">
          Gestiona tu cuenta
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <div className="px-4 py-3 bg-[#F8F7FF] border-b border-[#E8E5F0]">
          <h3 className="font-semibold text-[#2D2A32] text-sm uppercase tracking-wide">
            Perfil
          </h3>
        </div>
        <div className="divide-y divide-[#E8E5F0]">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center flex-shrink-0">
              <User className="text-[#A38EC3]" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2D2A32]">Nombre</p>
              <p className="text-xs text-[#6B6570] truncate">{profile.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center flex-shrink-0">
              <Mail className="text-[#A38EC3]" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2D2A32]">Correo electrónico</p>
              <p className="text-xs text-[#6B6570] truncate">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="text-[#A38EC3]" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2D2A32]">Teléfono</p>
              <p className="text-xs text-[#6B6570] truncate">
                {profile.phone || 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* App Info */}
      <Card>
        <div className="px-4 py-3 bg-[#F8F7FF] border-b border-[#E8E5F0]">
          <h3 className="font-semibold text-[#2D2A32] text-sm uppercase tracking-wide">
            Información
          </h3>
        </div>
        <div className="divide-y divide-[#E8E5F0]">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-full bg-[#A38EC3]/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="text-[#A38EC3]" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2D2A32]">Versión de la app</p>
              <p className="text-xs text-[#6B6570]">1.0.0</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Logout Button */}
      <Card className="border-red-200">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <LogOut className="text-red-600" size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Cerrar sesión</p>
            <p className="text-xs text-red-400">
              {loggingOut ? 'Cerrando sesión...' : 'Salir de la aplicación'}
            </p>
          </div>
        </button>
      </Card>

      {/* App Info Footer */}
      <div className="text-center text-xs text-[#9A94A0] pt-4">
        <p>Espacio Desafíos v1.0.0</p>
        <p className="mt-1">© 2026 Todos los derechos reservados</p>
      </div>
    </div>
  );
}
