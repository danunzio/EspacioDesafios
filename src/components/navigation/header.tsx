'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Settings, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  isAdmin?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
  unreadCount?: number;
}

export function Header({ 
  title, 
  showBack = false, 
  onBack, 
  isAdmin = false,
  showSettings = true,
  showNotifications = true,
  unreadCount: initialCount = 0
}: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(initialCount);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();
  }, [supabase]);

  const handleNotificationsClick = () => {
    router.push(isAdmin ? '/admin/notificaciones' : '/profesional/notificaciones');
  };

  const handleSettingsClick = () => {
    router.push(isAdmin ? '/admin/configuracion' : '/profesional/configuracion');
  };

  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 bg-white shadow-sm">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section - Logo or Back button */}
        <div className="flex items-center justify-start flex-shrink-0 w-12">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="flex items-center">
              <img
                src="/logo.jpg"
                alt="Espacio Desafíos"
                width={36}
                height={36}
                className="rounded-lg object-cover w-9 h-9"
              />
            </div>
          )}
        </div>

        {/* Center section - Title */}
        <div className="flex-1 flex items-center justify-center px-4">
          <h1 className="text-base sm:text-lg font-semibold text-center truncate max-w-full">
            {title}
          </h1>
        </div>

        {/* Right section - Notifications and Settings buttons */}
        <div className="flex items-center justify-end flex-shrink-0 gap-1">
          {showNotifications && (
            <button
              onClick={handleNotificationsClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Notificaciones"
            >
              <Bell size={24} className="text-[#6B6570]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          {showSettings && (
            <button
              onClick={handleSettingsClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Configuración"
            >
              <Settings size={24} className="text-[#6B6570]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
