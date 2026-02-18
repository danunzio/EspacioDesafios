'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react'

interface Professional {
  id: string
  full_name: string
  email: string
}

interface Child {
  id: string
  full_name: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  health_insurance: string
  assigned_professional_id: string | null
  is_active: boolean
}

interface EditChildModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  child: Child | null
}

interface FormData {
  full_name: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  health_insurance: string
  custom_health_insurance: string
  assigned_professional_ids: string[]
  is_active: boolean
}

interface FormErrors {
  full_name?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  health_insurance?: string
  custom_health_insurance?: string
  general?: string
}

export function EditChildModal({ isOpen, onClose, onSuccess, child }: EditChildModalProps) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    health_insurance: '',
    custom_health_insurance: '',
    assigned_professional_ids: [],
    is_active: true,
  })
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [healthInsuranceOptions, setHealthInsuranceOptions] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchProfessionals()
      fetchHealthInsurances()
    }
  }, [isOpen])

  useEffect(() => {
    if (child && isOpen) {
      // Check if health_insurance is in the predefined list
      const isCustomInsurance = !healthInsuranceOptions.includes(child.health_insurance) && child.health_insurance

      // Fetch assigned professionals
      fetchAssignedProfessionals(child.id).then(assignedIds => {
        setFormData({
          full_name: child.full_name || '',
          guardian_name: child.guardian_name || '',
          guardian_phone: child.guardian_phone || '',
          guardian_email: child.guardian_email || '',
          health_insurance: isCustomInsurance ? 'Otra' : (child.health_insurance || ''),
          custom_health_insurance: isCustomInsurance ? (child.health_insurance || '') : '',
          assigned_professional_ids: assignedIds.length > 0 ? assignedIds : (child.assigned_professional_id ? [child.assigned_professional_id] : []),
          is_active: child.is_active ?? true,
        })
      })
    }
  }, [child, isOpen, healthInsuranceOptions])

  useEffect(() => {
    if (!isOpen) {
      setErrors({})
      setSuccess(false)
      setToast(null)
    }
  }, [isOpen])

  const fetchProfessionals = async () => {
    setFetchLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'professional')
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setProfessionals(data || [])
    } catch (error) {
      console.error('Error fetching professionals:', error)
      setToast({ message: 'Error al cargar profesionales', type: 'error' })
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchHealthInsurances = async () => {
    try {
      const { data, error } = await supabase
        .from('health_insurances')
        .select('name, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      const names = (data || []).map((item) => (item as { name: string }).name)
      setHealthInsuranceOptions(names)
    } catch (error) {
      console.error('Error fetching health insurances:', error)
      setToast({ message: 'Error al cargar obras sociales', type: 'error' })
    }
  }

  const fetchAssignedProfessionals = async (childId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('children_professionals')
        .select('professional_id')
        .eq('child_id', childId)

      if (error) throw error
      return data?.map(item => item.professional_id) || []
    } catch (error) {
      console.error('Error fetching assigned professionals:', error)
      return []
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre del paciente es obligatorio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !child) return

    setLoading(true)
    setErrors({})

    try {
      // Update child
      const { error: childError } = await supabase
        .from('children')
        .update({
          full_name: formData.full_name.trim(),
          guardian_name: formData.guardian_name.trim(),
          guardian_phone: formData.guardian_phone.trim(),
          guardian_email: formData.guardian_email.trim() || null,
          health_insurance: formData.health_insurance === 'Otra'
            ? formData.custom_health_insurance.trim()
            : formData.health_insurance || null,
          assigned_professional_id: formData.assigned_professional_ids[0] || null,
          is_active: formData.is_active,
        })
        .eq('id', child.id)

      if (childError) throw childError

      // Update professional relationships
      // First, delete existing relationships
      const { error: deleteError } = await supabase
        .from('children_professionals')
        .delete()
        .eq('child_id', child.id)

      if (deleteError) throw deleteError

      // Then insert new relationships (if more than one professional)
      if (formData.assigned_professional_ids.length > 1) {
        const professionalRelations = formData.assigned_professional_ids.map(profId => ({
          child_id: child.id,
          professional_id: profId,
        }))

        const { error: relationsError } = await supabase
          .from('children_professionals')
          .insert(professionalRelations)

        if (relationsError) throw relationsError
      }

      setSuccess(true)
      setToast({ message: 'Paciente actualizado exitosamente', type: 'success' })

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (error: unknown) {
      console.error('Error updating child:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar'
      setToast({ message: errorMessage, type: 'error' })
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!child) return

    const confirmed = confirm(`¿Estás seguro de eliminar a ${child.full_name}? Esta acción no se puede deshacer.`)
    if (!confirmed) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', child.id)

      if (error) throw error

      setToast({ message: 'Paciente eliminado exitosamente', type: 'success' })
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (error: unknown) {
      console.error('Error deleting child:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar'
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }))
    }
  }

  const toggleProfessional = (professionalId: string) => {
    const currentIds = formData.assigned_professional_ids
    const newIds = currentIds.includes(professionalId)
      ? currentIds.filter(id => id !== professionalId)
      : [...currentIds, professionalId]

    handleChange('assigned_professional_ids', newIds)
  }

  const selectedProfessionals = professionals.filter(p =>
    formData.assigned_professional_ids.includes(p.id)
  )

  if (!child) return null

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Editar Paciente"
        maxWidth="full"
      >
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle size={48} className="text-[#A8E6CF] mb-3" />
            <h3 className="text-lg font-semibold text-[#2D2A32] mb-1">
              ¡Actualizado!
            </h3>
            <p className="text-sm text-[#6B6570]">Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {errors.general && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                <AlertCircle size={14} />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#A38EC3] uppercase tracking-wide">
                Información del Paciente
              </h3>

              <Input
                label="Nombre completo"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Nombre del paciente"
                required
                error={errors.full_name}
              />



              <div className="w-full">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Obra Social
                </label>
                <select
                  value={formData.health_insurance}
                  onChange={(e) => handleChange('health_insurance', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-300 focus:border-[#A38EC3] focus:ring-0 focus:outline-none ${errors.health_insurance ? 'border-red-500' : ''}`}
                  required={false}
                >
                  <option value="">Seleccionar...</option>
                  {healthInsuranceOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.health_insurance && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.health_insurance}</p>
                )}
              </div>

              {formData.health_insurance === 'Otra' && (
                <Input
                  label="Nombre de la obra social *"
                  value={formData.custom_health_insurance}
                  onChange={(e) => handleChange('custom_health_insurance', e.target.value)}
                  placeholder="Ingrese el nombre de la obra social"
                  required={false}
                  error={errors.custom_health_insurance}
                />
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-[#A38EC3] uppercase tracking-wide">
                Responsable
              </h3>

              <Input
                label="Nombre"
                value={formData.guardian_name}
                onChange={(e) => handleChange('guardian_name', e.target.value)}
                placeholder="Nombre del responsable"
                required={false}
                error={errors.guardian_name}
              />

              <Input
                label="Teléfono"
                type="tel"
                value={formData.guardian_phone}
                onChange={(e) => handleChange('guardian_phone', e.target.value)}
                placeholder="+56 9 1234 5678"
                required={false}
                error={errors.guardian_phone}
              />

              <Input
                label="Email"
                type="email"
                value={formData.guardian_email}
                onChange={(e) => handleChange('guardian_email', e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-[#A38EC3] uppercase tracking-wide">
                Asignación de Profesionales
              </h3>

              {selectedProfessionals.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedProfessionals.map(prof => (
                    <span
                      key={prof.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#A38EC3]/10 text-[#A38EC3] rounded-full text-xs"
                    >
                      {prof.full_name}
                      <button
                        type="button"
                        onClick={() => toggleProfessional(prof.id)}
                        className="hover:bg-[#A38EC3]/20 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="w-full">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Seleccionar profesionales
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      toggleProfessional(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-300 focus:border-[#A38EC3] focus:ring-0 focus:outline-none disabled:bg-gray-100"
                  disabled={fetchLoading}
                >
                  <option value="">
                    {fetchLoading ? 'Cargando...' : 'Agregar profesional...'}
                  </option>
                  {professionals
                    .filter(p => !formData.assigned_professional_ids.includes(p.id))
                    .map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.full_name}
                      </option>
                    ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#6B6570]">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-[#A38EC3] focus:ring-[#A38EC3]"
                />
                Paciente activo
              </label>
            </div>

            <div className="flex gap-2 pt-3 sticky bottom-0 bg-white pb-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 text-xs"
                disabled={loading || fetchLoading}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>

            <div className="mt-4 p-3 border border-red-200 rounded-xl bg-red-50">
              <p className="text-xs text-red-700 mb-2">
                Eliminar eliminará permanentemente al paciente del sistema.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-100 text-xs"
                onClick={handleDelete}
                disabled={deleting || loading}
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} className="mr-1" />
                    Eliminar paciente
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {toast && (
        <div
          className={`fixed bottom-16 right-3 z-[60] flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg text-xs ${toast.type === 'success' ? 'bg-[#A8E6CF] text-green-800' : 'bg-[#F4C2C2] text-red-800'}`}
        >
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </>
  )
}
