'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

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
  birth_date: string
  parent_name: string
  parent_phone: string
  parent_email: string
  assigned_professional_id: string
  health_insurance: string
}

interface FormErrors {
  full_name?: string
  birth_date?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  assigned_professional_id?: string
  health_insurance?: string
  general?: string
}

const initialFormData: FormData = {
  full_name: '',
  birth_date: '',
  parent_name: '',
  parent_phone: '',
  parent_email: '',
  assigned_professional_id: '',
  health_insurance: '',
}

const healthInsuranceOptions = [
  'UP CERAMISTA',
  'AUSTRAL',
  'UP',
  'OSPACA',
  'IOSFA/ospecon',
  'Galeno/OSPAGA',
  'OSPECON',
  'MEDIFE',
  'Otra',
]

export function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchProfessionals()
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre del paciente es obligatorio'
    }

    if (!formData.parent_name.trim()) {
      newErrors.parent_name = 'El nombre del apoderado es obligatorio'
    }

    if (!formData.parent_phone.trim()) {
      newErrors.parent_phone = 'El teléfono del apoderado es obligatorio'
    } else if (!/^\+?[\d\s-]{8,}$/.test(formData.parent_phone)) {
      newErrors.parent_phone = 'Ingrese un teléfono válido'
    }

    if (formData.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email)) {
      newErrors.parent_email = 'Ingrese un correo electrónico válido'
    }

    if (!formData.assigned_professional_id) {
      newErrors.assigned_professional_id = 'Debe seleccionar un profesional'
    }

    if (!formData.health_insurance) {
      newErrors.health_insurance = 'Debe seleccionar una obra social'
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
      const { data: currentModule } = await supabase
        .from('module_values')
        .select('fee_value')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const feeValue = currentModule?.fee_value || 0

      const { error } = await supabase.from('children').insert({
        full_name: formData.full_name.trim(),
        birth_date: formData.birth_date || null,
        mother_name: formData.parent_name.trim(),
        mother_phone: formData.parent_phone.trim(),
        mother_email: formData.parent_email.trim() || null,
        assigned_professional_id: formData.assigned_professional_id,
        health_insurance: formData.health_insurance,
        fee_value: feeValue,
        is_active: true,
      })

      if (error) throw error

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

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

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
                label="Nombre completo *"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Nombre del paciente"
                required
                error={errors.full_name}
              />

              <Input
                label="Fecha de nacimiento"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
              />

              <div className="w-full">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Obra Social *
                </label>
                <select
                  value={formData.health_insurance}
                  onChange={(e) => handleChange('health_insurance', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-300 focus:border-[#A38EC3] focus:ring-0 focus:outline-none ${errors.health_insurance ? 'border-red-500' : ''}`}
                  required
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
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-[#A38EC3] uppercase tracking-wide">
                Apoderado
              </h3>

              <Input
                label="Nombre *"
                value={formData.parent_name}
                onChange={(e) => handleChange('parent_name', e.target.value)}
                placeholder="Nombre del apoderado"
                required
                error={errors.parent_name}
              />

              <Input
                label="Teléfono *"
                type="tel"
                value={formData.parent_phone}
                onChange={(e) => handleChange('parent_phone', e.target.value)}
                placeholder="+56 9 1234 5678"
                required
                error={errors.parent_phone}
              />

              <Input
                label="Email"
                type="email"
                value={formData.parent_email}
                onChange={(e) => handleChange('parent_email', e.target.value)}
                placeholder="email@ejemplo.com"
                error={errors.parent_email}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-[#A38EC3] uppercase tracking-wide">
                Asignación
              </h3>

              <div className="w-full">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Profesional *
                </label>
                <select
                  value={formData.assigned_professional_id}
                  onChange={(e) => handleChange('assigned_professional_id', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-300 focus:border-[#A38EC3] focus:ring-0 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.assigned_professional_id ? 'border-red-500' : ''}`}
                  disabled={fetchLoading}
                  required
                >
                  <option value="">
                    {fetchLoading ? 'Cargando...' : 'Seleccionar...'}
                  </option>
                  {professionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.full_name}
                    </option>
                  ))}
                </select>
                {errors.assigned_professional_id && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.assigned_professional_id}</p>
                )}
              </div>
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
