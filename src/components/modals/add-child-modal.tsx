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
}

interface FormErrors {
  full_name?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  assigned_professional_id?: string
  general?: string
}

const initialFormData: FormData = {
  full_name: '',
  birth_date: '',
  parent_name: '',
  parent_phone: '',
  parent_email: '',
  assigned_professional_id: '',
}

export function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const supabase = createClient()

  // Fetch professionals on mount
  useEffect(() => {
    if (isOpen) {
      fetchProfessionals()
    }
  }, [isOpen])

  // Reset form when modal closes
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
      newErrors.full_name = 'El nombre del niño es obligatorio'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      // Get the current module fee value
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
        fee_value: feeValue,
        is_active: true,
      })

      if (error) throw error

      setSuccess(true)
      setToast({ message: 'Niño agregado exitosamente', type: 'success' })

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
  } catch (error: unknown) {
    console.error('Error creating child:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al agregar el niño'
    setToast({ message: errorMessage, type: 'error' })
    setErrors({ general: errorMessage + '. Intente nuevamente.' })
  } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Agregar Nuevo Niño"
        maxWidth="lg"
      >
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle size={64} className="text-[#A8E6CF] mb-4" />
            <h3 className="text-xl font-semibold text-[#2D2A32] mb-2">
              ¡Niño agregado exitosamente!
            </h3>
            <p className="text-[#6B6570]">Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#A38EC3] uppercase tracking-wide">
                Información del Niño
              </h3>

              <Input
                label="Nombre completo del niño"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Ej: Juan Pérez García"
                required
                error={errors.full_name}
              />

              <Input
                label="Fecha de nacimiento"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-[#A38EC3] uppercase tracking-wide">
                Información del Apoderado
              </h3>

              <Input
                label="Nombre del apoderado"
                value={formData.parent_name}
                onChange={(e) => handleChange('parent_name', e.target.value)}
                placeholder="Ej: María García"
                required
                error={errors.parent_name}
              />

              <Input
                label="Teléfono del apoderado"
                type="tel"
                value={formData.parent_phone}
                onChange={(e) => handleChange('parent_phone', e.target.value)}
                placeholder="Ej: +56 9 1234 5678"
                required
                error={errors.parent_phone}
              />

              <Input
                label="Correo electrónico del apoderado"
                type="email"
                value={formData.parent_email}
                onChange={(e) => handleChange('parent_email', e.target.value)}
                placeholder="Ej: apoderado@email.com"
                error={errors.parent_email}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-[#A38EC3] uppercase tracking-wide">
                Asignación
              </h3>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profesional asignado
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formData.assigned_professional_id}
                  onChange={(e) => handleChange('assigned_professional_id', e.target.value)}
                  className={`
                    w-full px-4 py-2
                    rounded-xl border-2
                    border-gray-300
                    focus:border-[#A38EC3] focus:ring-0 focus:outline-none
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    transition-colors duration-200
                    ${errors.assigned_professional_id ? 'border-red-500 focus:border-red-500' : ''}
                  `}
                  disabled={fetchLoading}
                  required
                >
                  <option value="">
                    {fetchLoading ? 'Cargando profesionales...' : 'Seleccione un profesional'}
                  </option>
                  {professionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.full_name} ({professional.email})
                    </option>
                  ))}
                </select>
                {errors.assigned_professional_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.assigned_professional_id}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="sm:flex-1"
                disabled={loading || fetchLoading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Niño'
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`
            fixed bottom-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-fade-in
            ${toast.type === 'success' ? 'bg-[#A8E6CF] text-green-800' : 'bg-[#F4C2C2] text-red-800'}
          `}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </>
  )
}
