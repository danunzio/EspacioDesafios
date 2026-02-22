'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  Clock,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

export default function NotificacionesProfesionalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/profesional')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-[#6B6570]" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#2D2A32]">Notificaciones</h2>
          <p className="text-[#6B6570] mt-1">
            {unreadCount > 0 
              ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
              : 'No tienes notificaciones pendientes'
            }
          </p>
        </div>
      </div>

      {/* Actions */}
      {unreadCount > 0 && (
        <Button
          variant="outline"
          onClick={handleMarkAllAsRead}
          className="w-full sm:w-auto"
        >
          <CheckCheck size={18} className="mr-2" />
          Marcar todas como leídas
        </Button>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center text-[#6B6570]">
            Cargando notificaciones...
          </Card>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all ${
                notification.is_read ? 'bg-gray-50 opacity-75' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-medium text-[#2D2A32] ${
                        !notification.is_read ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-[#6B6570] mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-[#78716C]">
                        <Clock size={12} />
                        {new Date(notification.created_at).toLocaleString('es-CL')}
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors flex-shrink-0"
                        title="Marcar como leída"
                        aria-label="Marcar notificación como leída"
                      >
                        <Check size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Bell size={48} className="mx-auto mb-4 text-[#78716C] opacity-50" />
            <h3 className="text-lg font-semibold text-[#2D2A32] mb-2">
              No tienes notificaciones
            </h3>
            <p className="text-[#6B6570]">
              Las notificaciones aparecerán aquí cuando tengas mensajes importantes
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
