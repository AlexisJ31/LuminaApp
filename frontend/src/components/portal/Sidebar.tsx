import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  CalendarClock, 
  PieChart, 
  Settings, 
  HelpCircle, 
  Search,
  CreditCard,
  Building2,
  Banknote
} from 'lucide-react';
import LuminaLogo from '../LuminaLogo';

import { useFinance } from '../../context/FinanceContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreviewedCount?: number;
}

export default function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const { accounts: liveAccounts, unreviewedCount: liveUnreviewedCount } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'review', label: 'Por Revisar', icon: Receipt, badge: liveUnreviewedCount },
    { id: 'transactions', label: 'Transacciones', icon: Wallet },
    { id: 'recurrings', label: 'Recurrentes', icon: CalendarClock },
    { id: 'budgets', label: 'Presupuestos', icon: PieChart },
  ];

  const getAccountIcon = (type: string) => {
    if (type === 'credit') return CreditCard;
    if (type === 'cash') return Banknote;
    return Building2;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full bg-white dark:bg-[#080A0F] border-r border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/80 p-4 select-none shrink-0 overflow-y-auto">
      
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-2 py-3 mb-4 cursor-pointer group" onClick={() => onTabChange('dashboard')}>
        <LuminaLogo isGlowing={true} className="w-8 h-8 shrink-0" />
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">LuminaApp</span>
            <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Personal
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-white/40 font-mono">v2.4 Live Connected</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
        <input 
          type="text" 
          placeholder="Buscar gastos, categorías..." 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onTabChange('transactions');
            }
          }}
          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
        />
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-2">Menú Principal</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold shadow-md' 
                  : 'text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : 'text-slate-400 dark:text-white/60'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-black dark:bg-black text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Accounts Breakdown */}
      <div className="mt-8 space-y-2">
        <div className="flex items-center justify-between px-3">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-white/30 uppercase tracking-wider">Mis Cuentas</p>
          <button 
            onClick={() => onTabChange('transactions')} 
            className="text-[10px] font-semibold text-emerald-400 hover:underline"
          >
            Ver Todas
          </button>
        </div>
        {liveAccounts.map((acc) => {
          const AccIcon = getAccountIcon(acc.type);
          return (
            <div 
              key={acc.id} 
              onClick={() => onTabChange('transactions')}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <AccIcon className={`w-3.5 h-3.5 ${acc.color} group-hover:scale-110 transition-transform`} />
                <span className="text-slate-600 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white truncate text-[11px] transition-colors">{acc.name}</span>
              </div>
              <span className="text-slate-900 dark:text-white/90 font-mono text-[11px] font-medium">
                ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5 space-y-1">
        <button 
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentTab === 'settings' ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span>Soporte & Ayuda</span>
        </button>
      </div>

    </aside>
  );
}
