'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Baby,
  Phone,
  Mail,
  Calendar,
  Search,
  User,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface Child {
  id: string;
  full_name: string;
  birth_date: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  diagnosis?: string;
  health_insurance: string;
  is_active: boolean;
}

// Mock data - replace with actual data fetching
const mockMyChildren: Child[] = [
  {
    id: '1',
    full_name: 'Juan Pérez García',
    birth_date: '2018-05-15',
    parent_name: 'María García',
    parent_phone: '+56 9 1234 5678',
    parent_email: 'maria@email.com',
    diagnosis: 'TDAH',
    health_insurance: 'AUSTRAL',
    is_active: true,
  },
  {
    id: '2',
    full_name: 'Sofia Martínez',
    birth_date: '2019-03-20',
    parent_name: 'Carlos Martínez',
    parent_phone: '+56 9 8765 4321',
    parent_email: 'carlos@email.com',
    diagnosis: 'Integración Sensorial',
    health_insurance: 'OSPACA',
    is_active: true,
  },
  {
    id: '3',
    full_name: 'Lucas Fernández',
    birth_date: '2017-08-10',
    parent_name: 'Ana Fernández',
    parent_phone: '+56 9 3456 7890',
    diagnosis: 'Desarrollo Motor',
    health_insurance: 'UP',
    is_active: true,
  },
  {
    id: '4',
    full_name: 'Emma Rodríguez',
    birth_date: '2019-11-25',
    parent_name: 'Pedro Rodríguez',
    parent_phone: '+56 9 5678 9012',
    health_insurance: 'MEDIFE',
    is_active: false,
  },
];

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function ProfessionalChildrenPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [children] = useState<Child[]>(mockMyChildren);

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const matchesSearch =
        child.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.diagnosis &&
          child.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = showInactive || child.is_active;
      return matchesSearch && matchesStatus;
    });
  }, [children, searchQuery, showInactive]);

  const activeCount = children.filter((c) => c.is_active).length;
  const inactiveCount = children.filter((c) => !c.is_active).length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2D2A32]">Mis Pacientes</h2>
        <p className="text-sm text-[#6B6570] mt-1">
          {activeCount} activos, {inactiveCount} inactivos
        </p>
      </div>

      {/* Búsqueda y filtros */}
      <Card variant="soft" className="space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A94A0]"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, apoderado o diagnóstico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[#6B6570]">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-[#A38EC3] focus:ring-[#A38EC3]"
          />
          Mostrar pacientes inactivos
        </label>
      </Card>

      {/* Lista de pacientes */}
      {filteredChildren.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredChildren.map((child) => (
            <Card
              key={child.id}
              className="p-4 hover:shadow-lg transition-shadow"
            >
              <Link href={`/profesional/ninos/${child.id}`} className="block">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#A38EC3]/15 flex items-center justify-center flex-shrink-0">
                    <Baby className="text-[#A38EC3]" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#2D2A32] text-base">
                        {child.full_name}
                      </h3>
                      {!child.is_active && (
                        <Badge variant="default" className="text-xs">Inactivo</Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                        <Calendar size={14} className="flex-shrink-0" />
                        {calculateAge(child.birth_date)} años
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                        <Shield size={14} className="flex-shrink-0" />
                        {child.health_insurance}
                      </span>
                      {child.diagnosis && (
                        <p className="text-sm text-[#A38EC3]">{child.diagnosis}</p>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-[#E8E5F0]">
                      <p className="text-sm font-medium text-[#6B6570] mb-2 flex items-center gap-1.5">
                        <User size={14} className="flex-shrink-0" />
                        Apoderado: {child.parent_name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`tel:${child.parent_phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#A38EC3]/10 text-[#A38EC3] rounded-lg text-sm hover:bg-[#A38EC3]/20 transition-colors"
                        >
                          <Phone size={14} />
                          Llamar
                        </a>
                        {child.parent_email && (
                          <a
                            href={`mailto:${child.parent_email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#A38EC3]/10 text-[#A38EC3] rounded-lg text-sm hover:bg-[#A38EC3]/20 transition-colors"
                          >
                            <Mail size={14} />
                            Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className="text-[#9A94A0] flex-shrink-0 mt-1"
                    size={20}
                  />
                </div>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Baby className="mx-auto mb-4 text-[#9A94A0]" size={48} />
          <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
            No se encontraron pacientes
          </h3>
          <p className="text-[#6B6570]">
            {searchQuery
              ? 'Intenta con otros términos de búsqueda'
              : 'No tienes pacientes asignados actualmente'}
          </p>
        </Card>
      )}

      <div className="text-sm text-[#6B6570] text-center">
        Mostrando {filteredChildren.length} de {children.length} pacientes
      </div>
    </div>
  );
}
