'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddProfessionalModal } from '@/components/modals/add-professional-modal';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Search,
} from 'lucide-react';

interface Professional {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  is_active: boolean;
}

interface AdminProfessionalsClientProps {
  initialProfessionals: Professional[];
}

export function AdminProfessionalsClient({ initialProfessionals }: AdminProfessionalsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSuccess = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  const handleEdit = (professional: Professional) => {
    // Por ahora solo mostramos un alert
    alert(`Editar profesional: ${professional.full_name}\n\nFuncionalidad en desarrollo. Aquí se abrirá un modal para editar los datos del profesional.`);
  };

  const handleDelete = (professional: Professional) => {
    if (confirm(`¿Estás seguro de eliminar a ${professional.full_name}?`)) {
      alert('Funcionalidad en desarrollo');
    }
  };

  const filteredProfessionals = professionals.filter((prof) =>
    prof.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-[#2D2A32]">
          Profesionales
        </h2>
        <p className="text-sm text-[#6B6570] mt-1">
          Gestiona los profesionales del centro
        </p>
      </div>

      {/* Botón Nuevo Profesional */}
      <Button 
        variant="primary" 
        onClick={() => setIsModalOpen(true)}
        className="w-full"
      >
        <Plus size={18} className="mr-2" />
        Nuevo Profesional
      </Button>

      {/* Búsqueda */}
      <Card variant="soft" className="flex items-center gap-3">
        <Search className="text-[#9A94A0] flex-shrink-0" size={20} />
        <input
          type="text"
          placeholder="Buscar profesional..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[#2D2A32] placeholder:text-[#9A94A0]"
        />
      </Card>

      {/* Lista de Profesionales */}
      {filteredProfessionals.length > 0 ? (
        <div className="space-y-3">
          {filteredProfessionals.map((professional) => (
            <Card
              key={professional.id}
              className="p-4 hover:shadow-lg transition-shadow"
            >
              {/* Layout vertical para móvil */}
              <div className="flex flex-col gap-3">
                {/* Info del profesional */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#A38EC3]/15 flex items-center justify-center flex-shrink-0">
                    <Users className="text-[#A38EC3]" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#2D2A32] text-base">
                        {professional.full_name}
                      </h3>
                      <Badge 
                        variant={professional.is_active ? 'success' : 'default'}
                        className="text-xs"
                      >
                        {professional.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      {professional.email && (
                        <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                          <Mail size={14} className="flex-shrink-0" />
                          <span className="truncate">{professional.email}</span>
                        </span>
                      )}
                      {professional.phone && (
                        <span className="flex items-center gap-1.5 text-sm text-[#6B6570]">
                          <Phone size={14} className="flex-shrink-0" />
                          <span>{professional.phone}</span>
                        </span>
                      )}
                      {professional.specialty && (
                        <p className="text-xs text-[#9A94A0] mt-1">
                          {professional.specialty}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(professional)}
                  >
                    <Pencil size={16} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(professional)}
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
          <Users className="mx-auto mb-4 text-[#9A94A0]" size={48} />
          <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
            No hay profesionales
          </h3>
          <p className="text-[#6B6570] mb-4">
            {searchQuery
              ? 'No se encontraron resultados para tu búsqueda'
              : 'Comienza agregando tu primer profesional a la clínica'}
          </p>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            Agregar Profesional
          </Button>
        </Card>
      )}

      <div className="text-sm text-[#6B6570] text-center">
        Mostrando {filteredProfessionals.length} de {professionals.length} profesionales
      </div>

      <AddProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
