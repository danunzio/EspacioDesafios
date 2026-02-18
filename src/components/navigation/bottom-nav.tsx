'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Baby, Settings, DollarSign, Calendar, Receipt, TrendingDown, BarChart3, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  userRole: 'admin' | 'professional';
}

const adminTabs = [
  { icon: Home, label: 'Inicio', href: '/admin' },
  { icon: Users, label: 'Profs', href: '/admin/profesionales' },
  { icon: Baby, label: 'Pacientes', href: '/admin/ninos' },
  { icon: DollarSign, label: 'Liquid', href: '/admin/liquidaciones' },
  { icon: BarChart3, label: 'Más', href: '/admin/mas' },
];

const professionalTabs = [
  { icon: Home, label: 'Inicio', href: '/profesional' },
  { icon: Baby, label: 'Pacientes', href: '/profesional/ninos' },
  { icon: Calendar, label: 'Sesiones', href: '/profesional/sesiones' },
  { icon: Receipt, label: 'Facturacion', href: '/profesional/facturacion' },
];

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = userRole === 'admin' ? adminTabs : professionalTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200',
                isActive ? 'text-[#A38EC3]' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] sm:text-xs font-medium truncate max-w-[60px] text-center leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
