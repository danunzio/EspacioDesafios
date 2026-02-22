'use client';

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AccordionSection } from '@/components/ui/accordion-section'
import { ProgressIndicator } from '@/components/ui/progress-indicator'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, AlertCircle, User, Mail, Lock } from 'lucide-react'

interface AddProfessionalModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  full_name: string
  email: string
  phone: string
  password: string
  specialty: string
}

interface FormErrors {
  full_name?: string
  email?: string
  phone?: string
  password?: string
  specialty?: string
  general?: string
}

const initialFormData: FormData = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  specialty: '',
}

export function AddProfessionalModal({ isOpen, onClose, onSuccess }: AddProfessionalModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const supabase = createClient()

  const steps = [
    { id: 'personal', label: 'Personal', completed: !!formData.full_name.trim() && !!formData.specialty.trim() },
    { id: 'contact', label: 'Contacto', completed: !!formData.email.trim() },
    { id: 'access', label: 'Acceso', completed: !!formData.password && formData.password.length >= 6 },
  ]

  const currentStep = !formData.full_name.trim() || !formData.specialty.trim() ? 'personal'
    : !formData.email.trim() ? 'contact'
    : 'access'

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
      setErrors({})
      setSuccess(false)
      setToast(null)
    }
  }, [isOpen])

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!formData.specialty.trim()) {
      newErrors.specialty = 'La especialidad es obligatoria'
    }

    if (formData.phone && !/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Ingrese un teléfono válido'
    }

    if (formData.email && !newErrors.email) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.email.toLowerCase())
          .maybeSingle()

        if (data) {
          newErrors.email = 'Este correo electrónico ya está registrado'
        }
      } catch (err) {
        console.error('Error checking email:', err)
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) return

    setLoading(true)
    setErrors({})

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name.trim(),
            role: 'professional',
          },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Este correo electrónico ya está registrado')
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario')
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: formData.email.toLowerCase().trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || null,
        specialty: formData.specialty.trim(),
        role: 'professional',
        is_active: true,
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error('Error al crear el perfil del profesional')
      }

      setSuccess(true)
      setToast({ message: 'Profesional creado exitosamente', type: 'success' })

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (error: unknown) {
      console.error('Error creating professional:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el profesional'
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
        title="Agregar Nuevo Profesional"
        maxWidth="md"
      >
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle size={64} className="text-[#A8E6CF] mb-4" />
            <h3 className="text-xl font-semibold text-[#2D2A32] mb-2">
              ¡Profesional creado exitosamente!
            </h3>
            <p className="text-[#6B6570]">
              Se ha enviado un correo de confirmación al profesional.
            </p>
            <p className="text-[#6B6570] mt-2">Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <ProgressIndicator steps={steps} currentStep={currentStep} className="mb-4" />

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <AccordionSection
              title="Información Personal"
              icon={<User size={12} />}
              defaultOpen={true}
              completed={!!formData.full_name.trim() && !!formData.specialty.trim()}
              required
            >
              <div className="space-y-2">
                <Input
                  label="Nombre completo"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Ej: Dr. María González"
                  required
                  error={errors.full_name}
                />

                <Input
                  label="Especialidad"
                  value={formData.specialty}
                  onChange={(e) => handleChange('specialty', e.target.value)}
                  placeholder="Ej: Psicología, Fonoaudiología, etc."
                  required
                  error={errors.specialty}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Ej: +56 9 1234 5678"
                  error={errors.phone}
                />
              </div>
            </AccordionSection>

            <AccordionSection
              title="Datos de Acceso"
              icon={<Lock size={12} />}
              defaultOpen={false}
              completed={!!formData.email.trim() && !!formData.password && formData.password.length >= 6}
              required
            >
              <div className="space-y-2">
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ej: profesional@espaciodesafios.cl"
                  required
                  error={errors.email}
                />

                <Input
                  label="Contraseña"
                  type="text"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  error={errors.password}
                />
              </div>
            </AccordionSection>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Profesional'
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

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
