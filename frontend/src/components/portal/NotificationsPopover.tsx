import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Zap, AlertTriangle, Calendar, X, Sparkles } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'webhook' | 'budget_alert' | 'recurring';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'webhook',
    title: 'Ingesta Automática n8n',
    message: 'Se registró una transacción de $4.50 en Uber Eats desde WhatsApp.',
    time: 'Hace 5 min',
    read: false,
  },
  {
    id: 'n-2',
    type: 'budget_alert',
    title: 'Alerta de Presupuesto (88%)',
    message: 'Has alcanzado el 88% del límite de la categoría Restaurantes.',
    time: 'Hace 2 horas',
    read: false,
  },
  {
    id: 'n-3',
    type: 'recurring',
    title: 'Próxima Suscripción',
    message: 'Spotify Premium ($9.99) se cobrará automáticamente en 3 días.',
    time: 'Ayer',
    read: true,
  },
];

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-white/10 dark:border-white/10 bg-slate-900/95 dark:bg-[#0E131F]/95 backdrop-blur-xl shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-sm tracking-tight">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {unreadCount} nuevas
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
                title="Marcar todas como leídas"
              >
                <Check className="w-3 h-3" />
                <span>Leídas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-white/40 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-white/20 animate-pulse" />
              <p className="text-xs">No tienes notificaciones pendientes</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                  );
                }}
                className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer group hover:bg-white/5 ${
                  !item.read ? 'bg-emerald-500/5' : ''
                }`}
              >
                {/* Icon Badge */}
                <div className="mt-0.5 shrink-0">
                  {item.type === 'webhook' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                      <Zap className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'budget_alert' && (
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'recurring' && (
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                      <Calendar className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold tracking-tight ${!item.read ? 'text-white' : 'text-white/70'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-white/40">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-snug truncate">
                    {item.message}
                  </p>
                </div>

                {/* Dismiss Action */}
                <button
                  onClick={(e) => removeNotification(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-white transition-opacity"
                  title="Eliminar notificación"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-white/5 border-t border-white/10 text-center">
          <span className="text-[10px] text-white/40">
            Sincronizado en tiempo real con n8n y Lumina Engine
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
