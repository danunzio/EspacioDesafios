'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useConfirm } from '@/components/ui/confirm-modal';
import { createClient } from '@/lib/supabase/client';
import { MoreVertical, Edit, Trash, Power } from 'lucide-react';
 
 interface HealthInsurance {
   id: string;
   name: string;
   is_active: boolean;
 }
 
export default function ObrasSocialesPage() {
  const confirm = useConfirm();
  const [healthInsurances, setHealthInsurances] = useState<HealthInsurance[]>([]);
   const [newInsuranceName, setNewInsuranceName] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [editingName, setEditingName] = useState('');
   const [selectedInsurance, setSelectedInsurance] = useState<HealthInsurance | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
 
   const supabase = createClient();
 
   const fetchHealthInsurances = useCallback(async () => {
     try {
       setError(null);
       const { data, error } = await supabase
         .from('health_insurances')
         .select('id, name, is_active')
         .order('name');
 
       if (error) {
         throw error;
       }
 
       setHealthInsurances(data || []);
     } catch (err) {
       console.error('Error fetching health insurances:', err);
       setError('No se pudieron cargar las obras sociales. Intenta nuevamente.');
     }
   }, [supabase]);
 
   useEffect(() => {
     fetchHealthInsurances();
   }, [fetchHealthInsurances]);
 
   const handleAddInsurance = async (e: React.FormEvent) => {
     e.preventDefault();
     const trimmedName = newInsuranceName.trim();
     if (!trimmedName) {
       setError('Ingresa el nombre de la obra social');
       return;
     }
 
     setLoading(true);
     setError(null);
     setSuccess(null);
 
     try {
       const { data, error } = await supabase
         .from('health_insurances')
         .insert({
           name: trimmedName,
           is_active: true,
         })
         .select('id, name, is_active')
         .single();
 
       if (error) {
         throw error;
       }
 
       setHealthInsurances((prev) => {
         const exists = prev.some((item) => item.name.toLowerCase() === trimmedName.toLowerCase());
         if (exists) {
           return prev;
         }
         return [...prev, data as HealthInsurance].sort((a, b) => a.name.localeCompare(b.name));
       });
 
       setNewInsuranceName('');
       setSuccess('Obra social agregada correctamente');
     } catch (err: unknown) {
       console.error('Error adding health insurance:', err);
       const message =
         err instanceof Error
           ? err.message
           : 'No se pudo agregar la obra social. Intenta nuevamente.';
       setError(message);
     } finally {
       setLoading(false);
     }
   };
 
   const handleStartEdit = (insurance: HealthInsurance) => {
     setEditingId(insurance.id);
     setEditingName(insurance.name);
     setError(null);
     setSuccess(null);
   };
 
   const handleCancelEdit = () => {
     setEditingId(null);
     setEditingName('');
   };
 
   const handleSaveEdit = async (id: string) => {
     const trimmedName = editingName.trim();
     if (!trimmedName) {
       setError('Ingresa el nombre de la obra social');
       return;
     }
 
     setLoading(true);
     setError(null);
     setSuccess(null);
 
     try {
       const { data, error } = await supabase
         .from('health_insurances')
         .update({ name: trimmedName })
         .eq('id', id)
         .select('id, name, is_active')
         .single();
 
       if (error) {
         throw error;
       }
 
       setHealthInsurances((prev) =>
         prev
           .map((item) => (item.id === id ? (data as HealthInsurance) : item))
           .sort((a, b) => a.name.localeCompare(b.name))
       );
 
       setSuccess('Obra social actualizada correctamente');
       setEditingId(null);
       setEditingName('');
     } catch (err: unknown) {
       console.error('Error updating health insurance:', err);
       const message =
         err instanceof Error
           ? err.message
           : 'No se pudo actualizar la obra social. Intenta nuevamente.';
       setError(message);
     } finally {
       setLoading(false);
     }
   };
 
   const handleToggleActive = async (insurance: HealthInsurance) => {
     setLoading(true);
     setError(null);
     setSuccess(null);
 
     try {
       const { data, error } = await supabase
         .from('health_insurances')
         .update({ is_active: !insurance.is_active })
         .eq('id', insurance.id)
         .select('id, name, is_active')
         .single();
 
       if (error) {
         throw error;
       }
 
       setHealthInsurances((prev) =>
         prev
           .map((item) => (item.id === insurance.id ? (data as HealthInsurance) : item))
           .sort((a, b) => a.name.localeCompare(b.name))
       );
 
       setSuccess(
         !insurance.is_active
           ? 'Obra social activada correctamente'
           : 'Obra social desactivada correctamente'
       );
     } catch (err: unknown) {
       console.error('Error toggling health insurance:', err);
       const message =
         err instanceof Error
           ? err.message
           : 'No se pudo actualizar el estado de la obra social. Intenta nuevamente.';
       setError(message);
     } finally {
       setLoading(false);
     }
   };
 
  const handleDeleteInsurance = async (id: string) => {
    const confirmed = await confirm({
      title: 'Eliminar obra social',
      message: '¿Estás seguro de eliminar esta obra social? Los pacientes existentes conservarán el texto actual.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      icon: 'trash',
    });
    if (!confirmed) return;

    setLoading(true);
     setError(null);
     setSuccess(null);
 
     try {
       const { error } = await supabase
         .from('health_insurances')
         .delete()
         .eq('id', id);
 
       if (error) {
         throw error;
       }
 
       setHealthInsurances((prev) => prev.filter((item) => item.id !== id));
       setSuccess('Obra social eliminada correctamente');
       if (editingId === id) {
         setEditingId(null);
         setEditingName('');
       }
     } catch (err: unknown) {
       console.error('Error deleting health insurance:', err);
       const message =
         err instanceof Error
           ? err.message
           : 'No se pudo eliminar la obra social. Intenta nuevamente.';
       setError(message);
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <div className="space-y-6 animate-fade-in">
       <div>
         <h2 className="text-2xl font-bold text-[#2D2A32]">Obras Sociales</h2>
         <p className="text-[#6B6570] mt-1">
           Agrega y gestiona las obras sociales disponibles para los pacientes.
         </p>
       </div>
 
       <Card>
         <div className="p-4 space-y-4">
           {error && (
             <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
               <span>{error}</span>
             </div>
           )}
 
           {success && (
             <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-xl text-green-600 text-xs">
               <span>{success}</span>
             </div>
           )}
 
           <form onSubmit={handleAddInsurance} className="flex flex-col sm:flex-row gap-2">
             <div className="flex-1">
               <Input
                 label="Nueva obra social"
                 value={newInsuranceName}
                 onChange={(e) => setNewInsuranceName(e.target.value)}
                 placeholder="Ej: OSDE, Swiss Medical..."
               />
             </div>
             <div className="flex items-end">
               <Button type="submit" variant="primary" disabled={loading}>
                 {loading ? 'Guardando...' : 'Agregar'}
               </Button>
             </div>
           </form>
 
           {healthInsurances.length > 0 && (
             <div className="pt-2 border-t border-gray-100 space-y-2">
               {healthInsurances.map((insurance) => (
                 <div
                   key={insurance.id}
                   className="flex items-center gap-2 justify-between"
                 >
                   <div className="flex-1 min-w-0">
                     {editingId === insurance.id ? (
                       <Input
                         value={editingName}
                         onChange={(e) => setEditingName(e.target.value)}
                         placeholder="Nombre de la obra social"
                       />
                     ) : (
                       <div className="flex items-center gap-2">
                         <span className="px-2 py-1 rounded-full text-xs bg-[#A38EC3]/10 text-[#2D2A32]">
                           {insurance.name}
                         </span>
                         {!insurance.is_active && (
                           <span className="text-xs text-[#78716C]">
                             Inactiva
                           </span>
                         )}
                       </div>
                     )}
                   </div>
                   <div className="flex items-center gap-1">
                     <Button
                       size="sm"
                       variant="outline"
                       className="p-2 h-auto rounded-full"
                       onClick={() => {
                         setSelectedInsurance(insurance);
                         setIsModalOpen(true);
                         setEditingId(null);
                       }}
                     >
                       <MoreVertical size={16} />
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       </Card>
 
       <Modal
         isOpen={isModalOpen}
         onClose={() => {
           setIsModalOpen(false);
           setSelectedInsurance(null);
           setEditingId(null);
         }}
         title={editingId ? 'Editar Obra Social' : 'Gestionar Obra Social'}
         maxWidth="sm"
       >
         {selectedInsurance && (
           <div className="space-y-6">
             {!editingId ? (
               <>
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <p className="text-sm text-[#6B6570]">Nombre</p>
                   <p className="text-lg font-bold text-[#2D2A32]">{selectedInsurance.name}</p>
                   <p className="text-xs mt-1">
                     Estado: <span className={selectedInsurance.is_active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                       {selectedInsurance.is_active ? 'Activa' : 'Inactiva'}
                     </span>
                   </p>
                 </div>
 
                 <div className="grid grid-cols-1 gap-2">
                   <Button
                     variant="outline"
                     className="justify-start gap-3 h-12 rounded-xl text-blue-600 border-blue-100 hover:bg-blue-50"
                     onClick={() => handleStartEdit(selectedInsurance)}
                   >
                     <Edit size={18} />
                     Editar Nombre
                   </Button>
 
                   <Button
                     variant="outline"
                     className={`${selectedInsurance.is_active
                       ? 'justify-start gap-3 h-12 rounded-xl text-amber-600 border-amber-100 hover:bg-amber-50'
                       : 'justify-start gap-3 h-12 rounded-xl text-green-600 border-green-100 hover:bg-green-50'
                       }`}
                     onClick={async () => {
                       await handleToggleActive(selectedInsurance);
                       setIsModalOpen(false);
                     }}
                   >
                     <Power size={18} />
                     {selectedInsurance.is_active ? 'Desactivar' : 'Activar'}
                   </Button>
 
                   <Button
                     variant="outline"
                     className="justify-start gap-3 h-12 rounded-xl text-red-600 border-red-100 hover:bg-red-50"
                     onClick={async () => {
                       await handleDeleteInsurance(selectedInsurance.id);
                       setIsModalOpen(false);
                     }}
                   >
                     <Trash size={18} />
                     Eliminar Permanente
                   </Button>
                 </div>
               </>
             ) : (
               <div className="space-y-4">
                 <Input
                   label="Nuevo nombre"
                   value={editingName}
                   onChange={(e) => setEditingName(e.target.value)}
                   autoFocus
                 />
                 <div className="flex gap-2">
                   <Button
                     variant="primary"
                     className="flex-1"
                     onClick={() => handleSaveEdit(selectedInsurance.id)}
                     disabled={loading}
                   >
                     {loading ? 'Guardando...' : 'Guardar Cambios'}
                   </Button>
                   <Button
                     variant="outline"
                     className="flex-1"
                     onClick={handleCancelEdit}
                     disabled={loading}
                   >
                     Cancelar
                   </Button>
                 </div>
               </div>
             )}
           </div>
         )}
       </Modal>
     </div>
   );
 }
