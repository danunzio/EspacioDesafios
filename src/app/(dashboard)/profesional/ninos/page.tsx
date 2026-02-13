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
} from 'lucide-react';

interface Child {
  id: string;
  full_name: string;
  birth_date: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  diagnosis?: string;
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
    is_active: true,
  },
  {
    id: '3',
    full_name: 'Lucas Fernández',
    birth_date: '2017-08-10',
    parent_name: 'Ana Fernández',
    parent_phone: '+56 9 3456 7890',
    diagnosis: 'Desarrollo Motor',
    is_active: true,
  },
  {
    id: '4',
    full_name: 'Emma Rodríguez',
    birth_date: '2019-11-25',
    parent_name: 'Pedro Rodríguez',
    parent_phone: '+56 9 5678 9012',
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Mis Niños</h2>
        <p className="text-[#6B6570] mt-1">
          {activeCount} activos, {inactiveCount} inactivos
        </p>
      </div>

      <Card variant="soft" className="space-y-4">
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
          Mostrar niños inactivos
        </label>
      </Card>

      {filteredChildren.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChildren.map((child) => (
            <Card
              key={child.id}
              className="hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#A38EC3]/15 flex items-center justify-center flex-shrink-0">
                    <Baby className="text-[#A38EC3]" size={28} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#2D2A32]">
                        {child.full_name}
                      </h3>
                      {!child.is_active && (
                        <Badge variant="default">Inactivo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#6B6570]">
                      <Calendar size={14} />
                      {calculateAge(child.birth_date)} años
                    </div>
                    {child.diagnosis && (
                      <p className="text-sm text-[#A38EC3]">{child.diagnosis}</p>
                    )}
                  </div>
                </div>
                <ChevronRight
                  className="text-[#9A94A0] group-hover:text-[#A38EC3] transition-colors"
                  size={20}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-[#E8E5F0]">
                <p className="text-sm font-medium text-[#6B6570] mb-2 flex items-center gap-1">
                  <User size={14} />
                  Apoderado: {child.parent_name}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${child.parent_phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#A38EC3]/10 text-[#A38EC3] rounded-lg text-sm hover:bg-[#A38EC3]/20 transition-colors"
                  >
                    <Phone size={14} />
                    Llamar
                  </a>
                  {child.parent_email && (
                    <a
                      href={`mailto:${child.parent_email}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#A38EC3]/10 text-[#A38EC3] rounded-lg text-sm hover:bg-[#A38EC3]/20 transition-colors"
                    >
                      <Mail size={14} />
                      Email
                    </a>
                  )}
                  <Link href={`/profesional/ninos/${child.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Baby className="mx-auto mb-4 text-[#9A94A0]" size={48} />
          <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
            No se encontraron niños
          </h3>
          <p className="text-[#6B6570]">
            {searchQuery
              ? 'Intenta con otros términos de búsqueda'
              : 'No tienes niños asignados actualmente'}
          </p>
        </Card>
      )}

      <div className="text-sm text-[#6B6570] text-center">
        Mostrando {filteredChildren.length} de {children.length} niños
      </div>
    </div>
  );
}
