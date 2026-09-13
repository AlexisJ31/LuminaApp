import { Bell, Plus, Sun, Moon, ArrowLeft } from 'lucide-react';
import LuminaLogo from '../LuminaLogo';

interface TopbarProps {
  currentTab: string;
  onOpenNewTransaction: () => void;
  onNavigateHome: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export default function Topbar({ 
  currentTab, 
  onOpenNewTransaction,
  onNavigateHome,
  isDarkMode = true,
  toggleTheme 
}: TopbarProps) {
  const titleMap: Record<string, string> = {
    dashboard: 'Resumen Financiero',
    review: 'Bandeja de Entrada (Por Revisar)',
    transactions: 'Historial de Transacciones',
    recurrings: 'Suscripciones y Gastos Fijos',
    budgets: 'Presupuestos y Límites',
    settings: 'Configuración del Perfil'
  };

  return (
    <header className="w-full h-16 border-b border-white/5 bg-[#080A0F]/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      
      {/* Mobile Brand / Back Button */}
      <div className="flex items-center space-x-3">
        <div className="lg:hidden flex items-center space-x-2 cursor-pointer" onClick={onNavigateHome}>
          <LuminaLogo isGlowing={true} className="w-6 h-6" />
          <span className="font-semibold text-sm tracking-tight text-white">Lumina</span>
        </div>

        <div className="hidden lg:flex flex-col">
          <h1 className="text-sm font-semibold text-white tracking-tight">
            {titleMap[currentTab] || 'Portal de Usuario'}
          </h1>
          <p className="text-[11px] text-white/40">Hola, Alexis 👋 — Todo bajo control este mes</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        
        {/* Back to Landing */}
        <button 
          onClick={onNavigateHome}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium border border-white/5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
        </button>

        {/* Theme Switcher (if available) */}
        {toggleTheme && (
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition-colors"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Action Button: New Transaction (Desktop) */}
        <button
          onClick={onOpenNewTransaction}
          className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Registrar Gasto</span>
        </button>

        {/* Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white/10">
            AJ
          </div>
        </div>

      </div>

    </header>
  );
}
