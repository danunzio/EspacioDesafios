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

interface Child {
  id: string
  full_name: string
  birth_date: string | null
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
  birth_date: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  health_insurance: string
  assigned_professional_id: string
  is_active: boolean
}

interface FormErrors {
  full_name?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  health_insurance?: string
  general?: string
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

export function EditChildModal({ isOpen, onClose, onSuccess, child }: EditChildModalProps) {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    birth_date: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    health_insurance: '',
    assigned_professional_id: '',
    is_active: true,
  })
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
    if (child && isOpen) {
      setFormData({
        full_name: child.full_name || '',
        birth_date: child.birth_date || '',
        guardian_name: child.guardian_name || '',
        guardian_phone: child.guardian_phone || '',
        guardian_email: child.guardian_email || '',
        health_insurance: child.health_insurance || '',
        assigned_professional_id: child.assigned_professional_id || '',
        is_active: child.is_active ?? true,
      })
    }
  }, [child, isOpen])

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre del paciente es obligatorio'
    }

    if (!formData.guardian_name.trim()) {
      newErrors.guardian_name = 'El nombre del apoderado es obligatorio'
    }

    if (!formData.guardian_phone.trim()) {
      newErrors.guardian_phone = 'El teléfono es obligatorio'
    }

    if (!formData.health_insurance) {
      newErrors.health_insurance = 'Debe seleccionar una obra social'
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
      const { error } = await supabase
        .from('children')
        .update({
          full_name: formData.full_name.trim(),
          birth_date: formData.birth_date || null,
          guardian_name: formData.guardian_name.trim(),
          guardian_phone: formData.guardian_phone.trim(),
          guardian_email: formData.guardian_email.trim() || null,
          health_insurance: formData.health_insurance,
          assigned_professional_id: formData.assigned_professional_id || null,
          is_active: formData.is_active,
        })
        .eq('id', child.id)

      if (error) throw error

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

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }))
    }
  }

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
                label="Nombre"
                value={formData.guardian_name}
                onChange={(e) => handleChange('guardian_name', e.target.value)}
                placeholder="Nombre del apoderado"
                required
                error={errors.guardian_name}
              />

              <Input
                label="Teléfono"
                type="tel"
                value={formData.guardian_phone}
                onChange={(e) => handleChange('guardian_phone', e.target.value)}
                placeholder="+56 9 1234 5678"
                required
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
                Asignación
              </h3>

              <div className="w-full">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Profesional
                </label>
                <select
                  value={formData.assigned_professional_id}
                  onChange={(e) => handleChange('assigned_professional_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-300 focus:border-[#A38EC3] focus:ring-0 focus:outline-none disabled:bg-gray-100"
                  disabled={fetchLoading}
                >
                  <option value="">Sin asignar</option>
                  {professionals.map((prof) => (
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
