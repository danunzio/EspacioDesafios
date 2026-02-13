'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Baby,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Users,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

interface ChildWithProfessional {
  id: string;
  full_name: string;
  birth_date: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  assigned_professional_id: string | null;
  professional_name: string | null;
  is_active: boolean;
}

interface Professional {
  id: string;
  full_name: string;
}

// Mock data - replace with actual data fetching
const mockChildren: ChildWithProfessional[] = [
  {
    id: '1',
    full_name: 'Juan Pérez García',
    birth_date: '2018-05-15',
    parent_name: 'María García',
    parent_phone: '+56 9 1234 5678',
    parent_email: 'maria@email.com',
    assigned_professional_id: 'prof1',
    professional_name: 'Ana López',
    is_active: true,
  },
  {
    id: '2',
    full_name: 'Sofia Martínez',
    birth_date: '2019-03-20',
    parent_name: 'Carlos Martínez',
    parent_phone: '+56 9 8765 4321',
    parent_email: 'carlos@email.com',
    assigned_professional_id: 'prof1',
    professional_name: 'Ana López',
    is_active: true,
  },
  {
    id: '3',
    full_name: 'Mateo Silva',
    birth_date: '2017-11-10',
    parent_name: 'Laura Silva',
    parent_phone: '+56 9 2345 6789',
    parent_email: 'laura@email.com',
    assigned_professional_id: 'prof2',
    professional_name: 'Pedro Rojas',
    is_active: true,
  },
];

const mockProfessionals: Professional[] = [
  { id: 'prof1', full_name: 'Ana López' },
  { id: 'prof2', full_name: 'Pedro Rojas' },
  { id: 'prof3', full_name: 'Carmen Díaz' },
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

export default function AdminChildrenPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [children, setChildren] = useState<ChildWithProfessional[]>(mockChildren);

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const matchesSearch =
        child.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.parent_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProfessional =
        selectedProfessional === 'all' ||
        child.assigned_professional_id === selectedProfessional;
      return matchesSearch && matchesProfessional;
    });
  }, [children, searchQuery, selectedProfessional]);

  const handleDelete = (childId: string) => {
    if (confirm('¿Estás seguro de eliminar este niño?')) {
      setChildren((prev) => prev.filter((c) => c.id !== childId));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A32]">Niños</h2>
          <p className="text-[#6B6570] mt-1">
            Gestiona los niños registrados en la clínica
          </p>
        </div>
        <Link href="/admin/ninos/nuevo">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Nuevo Niño
          </Button>
        </Link>
      </div>

      <Card variant="soft" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A94A0]"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o apoderado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#9A94A0]" />
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#A38EC3] focus:outline-none bg-white"
            >
              <option value="all">Todos los profesionales</option>
              {mockProfessionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {filteredChildren.length > 0 ? (
        <div className="space-y-3">
          {filteredChildren.map((child) => (
            <Card
              key={child.id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#A38EC3]/15 flex items-center justify-center flex-shrink-0">
                    <Baby className="text-[#A38EC3]" size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#2D2A32]">
                        {child.full_name}
                      </h3>
                      <Badge variant={child.is_active ? 'success' : 'default'}>
                        {child.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6B6570]">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {calculateAge(child.birth_date)} años
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {child.parent_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {child.parent_phone}
                      </span>
                      {child.parent_email && (
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {child.parent_email}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#A38EC3]">
                      Profesional: {child.professional_name || 'Sin asignar'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <Link href={`/admin/ninos/${child.id}/editar`}>
                    <Button variant="outline" size="sm">
                      <Pencil size={16} className="mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(child.id)}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Eliminar
                  </Button>
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
          <p className="text-[#6B6570] mb-4">
            {searchQuery || selectedProfessional !== 'all'
              ? 'Intenta con otros filtros de búsqueda'
              : 'Comienza agregando tu primer niño a la clínica'}
          </p>
          {!searchQuery && selectedProfessional === 'all' && (
            <Link href="/admin/ninos/nuevo">
              <Button variant="primary">
                <Plus size={18} className="mr-2" />
                Agregar Niño
              </Button>
            </Link>
          )}
        </Card>
      )}

      <div className="text-sm text-[#6B6570] text-center">
        Mostrando {filteredChildren.length} de {children.length} niños
      </div>
    </div>
  );
}
