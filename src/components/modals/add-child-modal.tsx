'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AccordionSection } from '@/components/ui/accordion-section'
import { ProgressIndicator } from '@/components/ui/progress-indicator'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, AlertCircle, X, Baby, Users, Stethoscope } from 'lucide-react'

interface Professional {
  id: string
  full_name: string
  email: string
}

interface AddChildModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  full_name: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  assigned_professional_ids: string[]
  health_insurance: string
  custom_health_insurance: string
}

interface FormErrors {
  full_name?: string
  birth_date?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  assigned_professional_ids?: string
  health_insurance?: string
  custom_health_insurance?: string
  general?: string
}

const initialFormData: FormData = {
  full_name: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_email: '',
  assigned_professional_ids: [],
  health_insurance: '',
  custom_health_insurance: '',
}

export function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [healthInsuranceOptions, setHealthInsuranceOptions] = useState<string[]>([])

  const supabase = createClient()

  const steps = [
    { id: 'patient', label: 'Paciente', completed: !!formData.full_name.trim() },
    { id: 'guardian', label: 'Responsable', completed: !!formData.guardian_name.trim() || !!formData.guardian_phone.trim() },
    { id: 'assignment', label: 'Asignación', completed: formData.assigned_professional_ids.length > 0 },
  ]

  const currentStep = !formData.full_name.trim() ? 'patient' 
    : !formData.guardian_name.trim() && !formData.guardian_phone.trim() ? 'guardian'
    : 'assignment'

  useEffect(() => {
    if (isOpen) {
      fetchProfessionals()
      fetchHealthInsurances()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
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

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          full_name: formData.full_name.trim(),
          guardian_name: formData.guardian_name?.trim() || '',
          guardian_phone: formData.guardian_phone?.trim() || '',
          guardian_email: formData.guardian_email?.trim() || null,
          assigned_professional_id: formData.assigned_professional_ids[0] || null,
          health_insurance: formData.health_insurance === 'Otra'
            ? formData.custom_health_insurance.trim()
            : formData.health_insurance || null,
          is_active: true,
        })
        .select()
        .single()

      if (childError) throw childError

      if (formData.assigned_professional_ids.length > 1) {
        const professionalRelations = formData.assigned_professional_ids.map(profId => ({
          child_id: childData.id,
          professional_id: profId,
        }))

        const { error: relationsError } = await supabase
          .from('children_professionals')
          .insert(professionalRelations)

        if (relationsError) throw relationsError
      }

      setSuccess(true)
      setToast({ message: 'Paciente agregado exitosamente', type: 'success' })

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (error: unknown) {
      console.error('Error creating child:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al agregar el paciente'
      setToast({ message: errorMessage, type: 'error' })
      setErrors({ general: errorMessage + '. Intente nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Agregar Paciente"
        maxWidth="full"
      >
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle size={48} className="text-[#A8E6CF] mb-3" />
            <h3 className="text-lg font-semibold text-[#2D2A32] mb-1">
              ¡Agregado!
            </h3>
            <p className="text-sm text-[#6B6570]">Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <ProgressIndicator steps={steps} currentStep={currentStep} className="mb-4" />

            {errors.general && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                <AlertCircle size={14} />
                <span>{errors.general}</span>
              </div>
            )}

            <AccordionSection
              title="Información del Paciente"
              icon={<Baby size={12} />}
              defaultOpen={true}
              completed={!!formData.full_name.trim()}
              required
            >
              <div className="space-y-2">
                <Input
                  label="Nombre completo *"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Nombre del paciente"
                  required
                  error={errors.full_name}
                />

                <div className="w-full">
                  <label htmlFor="child-health-insurance" className="block text-xs font-medium text-gray-700 mb-1">
                    Obra Social
                  </label>
                  <select
                    id="child-health-insurance"
                    value={formData.health_insurance}
                    onChange={(e) => handleChange('health_insurance', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-300 focus:border-[#A38EC3] focus:ring-0 focus:outline-none ${errors.health_insurance ? 'border-red-500' : ''}`}
                  >
                    <option value="">Seleccionar...</option>
                    {healthInsuranceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {formData.health_insurance === 'Otra' && (
                  <Input
                    label="Nombre de la obra social *"
                    value={formData.custom_health_insurance}
                    onChange={(e) => handleChange('custom_health_insurance', e.target.value)}
                    placeholder="Ingrese el nombre de la obra social"
                    error={errors.custom_health_insurance}
                  />
                )}
              </div>
            </AccordionSection>

            <AccordionSection
              title="Datos del Responsable"
              icon={<Users size={12} />}
              defaultOpen={false}
              completed={!!formData.guardian_name.trim() || !!formData.guardian_phone.trim()}
            >
              <div className="space-y-2">
                <Input
                  label="Nombre"
                  value={formData.guardian_name}
                  onChange={(e) => handleChange('guardian_name', e.target.value)}
                  placeholder="Nombre del responsable"
                  error={errors.guardian_name}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.guardian_phone}
                  onChange={(e) => handleChange('guardian_phone', e.target.value)}
                  placeholder="+56 9 1234 5678"
                  error={errors.guardian_phone}
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.guardian_email}
                  onChange={(e) => handleChange('guardian_email', e.target.value)}
                  placeholder="email@ejemplo.com"
                  error={errors.guardian_email}
                />
              </div>
            </AccordionSection>

            <AccordionSection
              title="Asignación de Profesionales"
              icon={<Stethoscope size={12} />}
              defaultOpen={false}
              completed={formData.assigned_professional_ids.length > 0}
            >
              <div className="space-y-2">
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
                          aria-label={`Quitar ${prof.full_name}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="w-full">
                  <label htmlFor="add-professional-select" className="block text-xs font-medium text-gray-700 mb-1">
                    Seleccionar profesionales
                  </label>
                  <select
                    id="add-professional-select"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleProfessional(e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-300 focus:border-[#A38EC3] focus:ring-0 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.assigned_professional_ids ? 'border-red-500' : ''}`}
                    disabled={fetchLoading}
                  >
                    <option value="">
                      {fetchLoading ? 'Cargando...' : 'Agregar profesional...'}
                    </option>
                    {professionals
                      .filter(p => !formData.assigned_professional_ids.includes(p.id))
                      .map((professional) => (
                        <option key={professional.id} value={professional.id}>
                          {professional.full_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </AccordionSection>

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
