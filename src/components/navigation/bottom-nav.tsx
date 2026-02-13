'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Baby, Settings, DollarSign, Calendar, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  userRole: 'admin' | 'professional';
}

const adminTabs = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Profesionales', href: '/professionals' },
  { icon: Baby, label: 'Niños', href: '/children' },
  { icon: Settings, label: 'Valores', href: '/settings' },
  { icon: DollarSign, label: 'Liquidaciones', href: '/payments' },
];

const professionalTabs = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Baby, label: 'Mis Niños', href: '/my-children' },
  { icon: Calendar, label: 'Sesiones', href: '/sessions' },
  { icon: Receipt, label: 'Facturación', href: '/billing' },
];

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = userRole === 'admin' ? adminTabs : professionalTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon size={24} />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
