'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddProfessionalModal } from '@/components/modals/add-professional-modal';
import { EditProfessionalModal } from '@/components/modals/edit-professional-modal';
import {
  Users,
  Plus,
  Pencil,
  Mail,
  Phone,
  Search,
  ArrowUpDown,
} from 'lucide-react';

// Icono de WhatsApp personalizado
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className="text-green-500"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

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
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByStatus, setSortByStatus] = useState(true);

  const handleSuccess = () => {
    window.location.reload();
  };

  const handleEdit = (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsEditModalOpen(true);
  };

  const handleDelete = (professional: Professional) => {
    if (confirm(`¿Estás seguro de eliminar a ${professional.full_name}?`)) {
      alert('Funcionalidad en desarrollo');
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const filteredAndSortedProfessionals = useMemo(() => {
    // Filtrar
    let filtered = professionals.filter((prof) =>
      prof.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Ordenar: Activos primero, luego Inactivos
    if (sortByStatus) {
      filtered = [...filtered].sort((a, b) => {
        if (a.is_active === b.is_active) return 0;
        return a.is_active ? -1 : 1;
      });
    }

    return filtered;
  }, [professionals, searchQuery, sortByStatus]);

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

      {/* Búsqueda y Ordenamiento */}
      <div className="space-y-2">
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
        
        <button
          onClick={() => setSortByStatus(!sortByStatus)}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
            sortByStatus ? 'bg-[#A38EC3]/10 text-[#A38EC3]' : 'text-[#6B6570] hover:bg-gray-100'
          }`}
        >
          <ArrowUpDown size={16} />
          {sortByStatus ? 'Ordenado: Activos primero' : 'Ordenar por estado'}
        </button>
      </div>

      {/* Lista de Profesionales */}
      {filteredAndSortedProfessionals.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedProfessionals.map((professional) => (
            <div
              key={professional.id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/profesionales/${professional.id}`)}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow">
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
                          <div className="flex items-center gap-2">
                            <a 
                              href={`tel:${professional.phone}`}
                              className="flex items-center gap-1.5 text-sm text-[#6B6570] hover:text-[#A38EC3] transition-colors"
                            >
                              <Phone size={14} className="flex-shrink-0" />
                              <span>{professional.phone}</span>
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp(professional.phone);
                              }}
                              className="p-1 hover:bg-green-50 rounded-full transition-colors"
                              title="Enviar WhatsApp"
                            >
                              <WhatsAppIcon size={16} />
                            </button>
                          </div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(professional);
                      }}
                    >
                      <Pencil size={16} className="mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
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
        Mostrando {filteredAndSortedProfessionals.length} de {professionals.length} profesionales
      </div>

      <AddProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditProfessionalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        professional={selectedProfessional}
      />
    </div>
  );
}
