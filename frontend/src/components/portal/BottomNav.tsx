import { LayoutDashboard, Receipt, Plus, PieChart, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewTransaction: () => void;
  unreviewedCount?: number;
}

export default function BottomNav({ 
  currentTab, 
  onTabChange, 
  onOpenNewTransaction,
  unreviewedCount = 3 
}: BottomNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080A0F]/95 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-2 select-none shadow-2xl">
      
      {/* 1. Tab Dashboard */}
      <button 
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
          currentTab === 'dashboard' ? 'text-white font-semibold' : 'text-white/40 hover:text-white/70'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Inicio</span>
      </button>

      {/* 2. Tab Inbox / Por Revisar */}
      <button 
        onClick={() => onTabChange('review')}
        className={`flex flex-col items-center justify-center w-14 py-1 relative transition-colors ${
          currentTab === 'review' ? 'text-white font-semibold' : 'text-white/40 hover:text-white/70'
        }`}
      >
        <div className="relative">
          <Receipt className="w-5 h-5 mb-0.5" />
          {unreviewedCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-500 text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
              {unreviewedCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Inbox</span>
      </button>

      {/* 3. FAB (Floating Action Button) Masivo Central */}
      <div className="relative -top-5 flex items-center justify-center">
        <button
          onClick={onOpenNewTransaction}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 ring-4 ring-[#080A0F]"
          aria-label="Registrar Gasto Rápido"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Tab Presupuestos */}
      <button 
        onClick={() => onTabChange('budgets')}
        className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
          currentTab === 'budgets' ? 'text-white font-semibold' : 'text-white/40 hover:text-white/70'
        }`}
      >
        <PieChart className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Límites</span>
      </button>

      {/* 5. Tab Perfil / Ajustes */}
      <button 
        onClick={() => onTabChange('settings')}
        className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
          currentTab === 'settings' ? 'text-white font-semibold' : 'text-white/40 hover:text-white/70'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Perfil</span>
      </button>

    </div>
  );
}
