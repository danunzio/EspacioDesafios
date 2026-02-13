import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Search,
} from 'lucide-react'

export default async function AdminProfessionalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/profesional')
  }

  const { data: professionals, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'professional')
    .order('full_name', { ascending: true })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A32]">
            Profesionales
          </h2>
          <p className="text-[#6B6570] mt-1">
            Gestiona los profesionales de la clínica
          </p>
        </div>
        <Link href="/admin/profesionales/nuevo">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Nuevo Profesional
          </Button>
        </Link>
      </div>

      <Card variant="soft" className="flex items-center gap-3">
        <Search className="text-[#9A94A0]" size={20} />
        <input
          type="text"
          placeholder="Buscar profesional..."
          className="flex-1 bg-transparent outline-none text-[#2D2A32] placeholder:text-[#9A94A0]"
        />
      </Card>

      {error ? (
        <Card className="text-center py-8">
          <p className="text-[#6B6570]">
            Error al cargar los profesionales. Intenta nuevamente.
          </p>
        </Card>
      ) : professionals && professionals.length > 0 ? (
        <div className="space-y-3">
          {professionals.map((professional) => (
            <Card
              key={professional.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#A38EC3]/15 flex items-center justify-center flex-shrink-0">
                  <Users className="text-[#A38EC3]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D2A32]">
                    {professional.full_name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-[#6B6570]">
                    {professional.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {professional.email}
                      </span>
                    )}
                    {professional.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {professional.phone}
                      </span>
                    )}
                  </div>
                  {professional.specialization && (
                    <p className="text-xs text-[#9A94A0] mt-1">
                      {professional.specialization}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/admin/profesionales/${professional.id}/editar`}>
                  <Button variant="outline" size="sm">
                    <Pencil size={16} className="mr-1" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-1" />
                  Eliminar
                </Button>
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
            Comienza agregando tu primer profesional a la clínica
          </p>
          <Link href="/admin/profesionales/nuevo">
            <Button variant="primary">
              <Plus size={18} className="mr-2" />
              Agregar Profesional
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
