import { useState, useRef, useEffect } from 'react';
import { Bell, Plus, Sun, Moon, ArrowLeft, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import LuminaLogo from '../LuminaLogo';
import NotificationsPopover from './NotificationsPopover';

interface TopbarProps {
  currentTab: string;
  onOpenNewTransaction: () => void;
  onNavigateHome: () => void;
  onTabChange?: (tab: string) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export default function Topbar({ 
  currentTab, 
  onOpenNewTransaction,
  onNavigateHome,
  onTabChange,
  isDarkMode = true,
  toggleTheme 
}: TopbarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const titleMap: Record<string, string> = {
    dashboard: 'Resumen Financiero',
    review: 'Bandeja de Revisión',
    transactions: 'Historial de Transacciones',
    recurrings: 'Gastos Fijos y Suscripciones',
    budgets: 'Presupuestos y Límites',
    settings: 'Configuración de la Cuenta'
  };

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="w-full h-14 border-b border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#090A0F]/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 select-none transition-colors duration-200">
      
      {/* Mobile Brand / Back Button */}
      <div className="flex items-center space-x-3">
        <div className="lg:hidden flex items-center space-x-2 cursor-pointer" onClick={onNavigateHome}>
          <LuminaLogo isGlowing={true} className="w-6 h-6" />
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">Lumina</span>
        </div>

        <div className="hidden lg:flex flex-col">
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {titleMap[currentTab] || 'Portal Financiero'}
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-sans">
            Alexis Jaén · Registro fiscal al día
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        
        {/* Back to Landing */}
        <button 
          onClick={onNavigateHome}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-medium border border-zinc-200/80 dark:border-white/[0.06] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>

        {/* Notifications Button & Popover */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/80 dark:border-white/[0.06] transition-all"
            aria-label="Abrir notificaciones"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
          </button>

          <NotificationsPopover 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
          />
        </div>

        {/* Theme Switcher */}
        {toggleTheme && (
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/80 dark:border-white/[0.06] transition-all"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-zinc-300" /> : <Moon className="w-3.5 h-3.5 text-zinc-700" />}
          </button>
        )}

        {/* Action Button: New Transaction (Linear Style) */}
        <button
          onClick={onOpenNewTransaction}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nuevo Movimiento</span>
        </button>

        {/* Avatar & Profile Dropdown */}
        <div className="relative pl-1.5 border-l border-zinc-200 dark:border-white/[0.08]" ref={profileMenuRef}>
          <button 
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all focus:outline-none"
            aria-label="Menú de perfil"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-800 dark:bg-zinc-800 text-zinc-200 border border-zinc-700 dark:border-zinc-700 flex items-center justify-center font-mono font-medium text-xs">
              AJ
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
          </button>

          {/* User Profile Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-11 w-56 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#12141C] shadow-2xl overflow-hidden text-zinc-800 dark:text-zinc-200 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Profile Header */}
              <div className="p-3 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02]">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Alexis Jaén</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">alexisjaen@lumina.app</p>
                <div className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Plan Personal Pro
                </div>
              </div>

              {/* Profile Actions */}
              <div className="p-1 space-y-0.5 text-xs font-medium">
                <button
                  onClick={() => {
                    onTabChange?.('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  <span>Configuración</span>
                </button>

                <button
                  onClick={() => {
                    onTabChange?.('dashboard');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  <span>Resumen de Cuenta</span>
                </button>

                <div className="my-1 border-t border-zinc-100 dark:border-white/[0.06]"></div>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigateHome();
                  }}
                  className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}


