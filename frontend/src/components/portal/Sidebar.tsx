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

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreviewedCount?: number;
}

export default function Sidebar({ currentTab, onTabChange, unreviewedCount = 3 }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'review', label: 'Por Revisar', icon: Receipt, badge: unreviewedCount },
    { id: 'transactions', label: 'Transacciones', icon: Wallet },
    { id: 'recurrings', label: 'Recurrentes', icon: CalendarClock },
    { id: 'budgets', label: 'Presupuestos', icon: PieChart },
  ];

  const accounts = [
    { name: 'Banco General Débito', balance: '$1,420.50', icon: Building2, color: 'text-blue-400' },
    { name: 'BAC Visa Crédito', balance: '$680.00', icon: CreditCard, color: 'text-amber-400' },
    { name: 'Efectivo Panamá', balance: '$150.00', icon: Banknote, color: 'text-emerald-400' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#080A0F] border-r border-white/5 text-white/80 p-4 select-none shrink-0">
      
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-2 py-3 mb-4 cursor-pointer" onClick={() => onTabChange('dashboard')}>
        <LuminaLogo isGlowing={true} className="w-8 h-8" />
        <span className="text-lg font-semibold tracking-tight text-white">LuminaApp</span>
        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Personal
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input 
          type="text" 
          placeholder="Buscar gastos, categorías..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
        />
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        <p className="px-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Menú Principal</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-black font-semibold shadow-lg shadow-white/5' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-white/60'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-black text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
        <p className="px-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Mis Cuentas</p>
        {accounts.map((acc, idx) => {
          const AccIcon = acc.icon;
          return (
            <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-xs transition-colors cursor-pointer">
              <div className="flex items-center space-x-2.5 truncate">
                <AccIcon className={`w-3.5 h-3.5 ${acc.color}`} />
                <span className="text-white/70 truncate text-[11px]">{acc.name}</span>
              </div>
              <span className="text-white/90 font-mono text-[11px] font-medium">{acc.balance}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
        <button 
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span>Soporte & Ayuda</span>
        </button>
      </div>

    </aside>
  );
}
