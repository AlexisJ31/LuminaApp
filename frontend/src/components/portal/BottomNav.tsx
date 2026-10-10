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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#090A0F]/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/[0.08] z-50 flex items-center justify-around px-2 select-none transition-colors duration-200">
      
      {/* 1. Tab Dashboard */}
      <button 
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center w-12 py-1 transition-colors ${
          currentTab === 'dashboard' ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <LayoutDashboard className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Inicio</span>
      </button>

      {/* 2. Tab Inbox */}
      <button 
        onClick={() => onTabChange('review')}
        className={`flex flex-col items-center justify-center w-12 py-1 relative transition-colors ${
          currentTab === 'review' ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <div className="relative">
          <Receipt className="w-4 h-4 mb-0.5" />
          {unreviewedCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-500 text-zinc-950 text-[9px] font-mono font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {unreviewedCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Inbox</span>
      </button>

      {/* 3. Action Button Central */}
      <div className="relative -top-3 flex items-center justify-center">
        <button
          onClick={onOpenNewTransaction}
          className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-md active:scale-95 transition-all ring-2 ring-zinc-50 dark:ring-[#090A0F]"
          aria-label="Nuevo Movimiento"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Tab Presupuestos */}
      <button 
        onClick={() => onTabChange('budgets')}
        className={`flex flex-col items-center justify-center w-12 py-1 transition-colors ${
          currentTab === 'budgets' ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <PieChart className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Límites</span>
      </button>

      {/* 5. Tab Perfil */}
      <button 
        onClick={() => onTabChange('settings')}
        className={`flex flex-col items-center justify-center w-12 py-1 transition-colors ${
          currentTab === 'settings' ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
      >
        <User className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Perfil</span>
      </button>

    </div>
  );
}

