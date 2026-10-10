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
    { id: 'review', label: 'Inbox de Revisión', icon: Receipt, badge: liveUnreviewedCount },
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
    <aside className="hidden lg:flex flex-col w-64 h-full bg-white dark:bg-[#0C0E14] border-r border-zinc-200 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 p-4 select-none shrink-0 overflow-y-auto">
      
      {/* Brand Header */}
      <div 
        className="flex items-center space-x-3 px-2 py-3 mb-3 cursor-pointer group" 
        onClick={() => onTabChange('dashboard')}
      >
        <LuminaLogo isGlowing={true} className="w-7 h-7 shrink-0" />
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-400 transition-colors">
              Lumina
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">
              Pro
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tight">Finanzas Inteligentes</span>
        </div>
      </div>

      {/* Search Input - Linear Style */}
      <div className="relative mb-5">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
        <input 
          type="text" 
          placeholder="Buscar transacciones..." 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onTabChange('transactions');
            }
          }}
          className="w-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/20 rounded-lg py-1.5 pl-8 pr-3 text-xs text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none transition-all font-sans"
        />
      </div>

      {/* Main Navigation */}
      <nav className="space-y-0.5">
        <p className="px-2.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          Plataforma
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-zinc-950' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-md ${
                  isActive 
                    ? 'bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900' 
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Accounts Breakdown */}
      <div className="mt-7 space-y-1.5">
        <div className="flex items-center justify-between px-2.5 mb-1">
          <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Cuentas Conectadas
          </p>
          <button 
            onClick={() => onTabChange('transactions')} 
            className="text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            Ver Todo
          </button>
        </div>
        {liveAccounts.map((acc) => {
          const AccIcon = getAccountIcon(acc.type);
          return (
            <div 
              key={acc.id} 
              onClick={() => onTabChange('transactions')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-2 truncate">
                <AccIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
                <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 truncate text-[11px] transition-colors">
                  {acc.name}
                </span>
              </div>
              <span className="text-zinc-900 dark:text-zinc-200 font-mono text-[11px] font-medium tabular-nums">
                ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-white/[0.06] space-y-0.5">
        <button 
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'settings' 
              ? 'bg-zinc-200/80 dark:bg-white/[0.08] text-zinc-900 dark:text-zinc-100' 
              : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>Configuración</span>
        </button>
        <button className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>Soporte Técnico</span>
        </button>
      </div>

    </aside>
  );
}

