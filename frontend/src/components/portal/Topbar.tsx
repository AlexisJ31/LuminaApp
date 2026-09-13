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
    review: 'Bandeja de Entrada (Por Revisar)',
    transactions: 'Historial de Transacciones',
    recurrings: 'Suscripciones y Gastos Fijos',
    budgets: 'Presupuestos y Límites',
    settings: 'Configuración del Perfil'
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
    <header className="w-full h-16 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#080A0F]/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 select-none transition-colors duration-300">
      
      {/* Mobile Brand / Back Button */}
      <div className="flex items-center space-x-3">
        <div className="lg:hidden flex items-center space-x-2 cursor-pointer" onClick={onNavigateHome}>
          <LuminaLogo isGlowing={true} className="w-6 h-6" />
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">Lumina</span>
        </div>

        <div className="hidden lg:flex flex-col">
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
            {titleMap[currentTab] || 'Portal de Usuario'}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-white/40">Hola, Alexis 👋 — Todo bajo control este mes</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        
        {/* Back to Landing */}
        <button 
          onClick={onNavigateHome}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white/70 text-xs font-medium border border-slate-200 dark:border-white/5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </button>

        {/* Notifications Button & Popover */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white/70 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-colors"
            aria-label="Abrir notificaciones"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          </button>

          <NotificationsPopover 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
          />
        </div>

        {/* Theme Switcher (if available) */}
        {toggleTheme && (
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white/70 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-colors"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        )}

        {/* Action Button: New Transaction (Desktop) */}
        <button
          onClick={onOpenNewTransaction}
          className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Gasto</span>
        </button>

        {/* Avatar & Profile Dropdown */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-white/10" ref={profileMenuRef}>
          <button 
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center space-x-1.5 p-0.5 rounded-full hover:opacity-90 transition-opacity focus:outline-none ring-2 ring-transparent focus:ring-emerald-500/50"
            aria-label="Menú de perfil"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-200 dark:ring-white/10">
              AJ
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500 dark:text-white/50" />
          </button>

          {/* User Profile Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E131F] shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Header */}
              <div className="p-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Alexis Jaén</p>
                <p className="text-[11px] text-slate-500 dark:text-white/40 truncate">alexisjaen@lumina.app</p>
                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Plan Personal Pro
                </div>
              </div>

              {/* Profile Actions */}
              <div className="p-1.5 space-y-0.5 text-xs font-medium">
                <button
                  onClick={() => {
                    onTabChange?.('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-white/40" />
                  <span>Configuración del Perfil</span>
                </button>

                <button
                  onClick={() => {
                    onTabChange?.('dashboard');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400 dark:text-white/40" />
                  <span>Resumen de Cuenta</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-white/5"></div>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigateHome();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión / Salir</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}

