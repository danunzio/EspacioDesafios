 'use client';
 
 import { useRouter } from 'next/navigation';
 import { Card } from '@/components/ui/card';
 import {
   Settings,
   DollarSign,
   TrendingDown,
   BarChart3,
   ChevronRight,
   FileText,
   Briefcase,
   Heart,
   Clock,
   Zap,
   Flame,
   Droplets,
   Wallet
 } from 'lucide-react';
 
const menuItems = [
  {
    title: 'Pagos de Profesionales',
    description: 'Verifica y aprueba los pagos registrados por el equipo',
    href: '/admin/pagos',
    icon: Wallet,
    color: '#A38EC3',
    subIcons: []
  },
  {
    title: 'Configuración de Valores',
    description: 'Administra valores de nomenclador, módulos, OSDE y sesiones',
    href: '/admin/valores',
    icon: Settings,
    color: '#A38EC3',
    subIcons: [FileText, Briefcase, Heart, Clock]
  },
  {
    title: 'Panel de Gastos',
    description: 'Registro de gastos operativos (luz, gas, fotocopias, etc.)',
    href: '/admin/consumos',
    icon: TrendingDown,
    color: '#E8A5A5',
    subIcons: [Zap, Flame, Droplets]
  },
  {
    title: 'Estadísticas',
    description: 'Reportes visuales de facturación y volumen de sesiones',
    href: '/admin/estadisticas',
    icon: BarChart3,
    color: '#8ED9B8',
    subIcons: []
  },
  {
    title: 'Liquidaciones',
    description: 'Calcula y gestiona las liquidaciones mensuales',
    href: '/admin/liquidaciones',
    icon: DollarSign,
    color: '#8ED9B8',
    subIcons: []
  },
  {
    title: 'Obras Sociales',
    description: 'Gestiona las obras sociales disponibles',
    href: '/admin/obras-sociales',
    icon: Heart,
    color: '#A38EC3',
    subIcons: []
  },
];
 
 export default function AdminMorePage() {
   const router = useRouter();
 
   return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#2D2A32]">Más Opciones</h2>
        <p className="text-[#6B6570] mt-1">
          Accede a todas las herramientas de administración
        </p>
      </div>

      <div className="space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.href}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(item.href)}
            >
              <div className="p-4 flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon size={28} style={{ color: item.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2D2A32] text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6B6570] mt-1">
                    {item.description}
                  </p>

                  {item.subIcons.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      {item.subIcons.map((SubIcon, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                        >
                          <SubIcon size={14} className="text-[#9A94A0]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <ChevronRight className="text-[#9A94A0] flex-shrink-0" size={24} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sección Obras Sociales movida a /admin/obras-sociales */}

      <Card variant="soft" className="bg-gradient-to-r from-[#A38EC3]/5 to-[#F4C2C2]/5">
        <div className="p-4">
          <h4 className="font-semibold text-[#2D2A32] mb-2">
            ¿Necesitas ayuda?
          </h4>
          <p className="text-sm text-[#6B6570]">
            Si tienes alguna duda sobre cómo usar estas herramientas,
            contacta al administrador del sistema.
          </p>
        </div>
      </Card>
     </div>
   );
 }
