import { useState } from 'react';
import { TrendingUp, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface NetWorthCardProps {
  netWorthInCents?: number;
  growthPct?: number;
}

export default function NetWorthCard({
  netWorthInCents,
  growthPct = 32.5
}: NetWorthCardProps) {
  const { netWorth, accounts } = useFinance();
  const displayCents = netWorthInCents ?? Math.round(netWorth * 100);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const periodGrowthMap: Record<string, number> = {
    '1W': 1.8,
    '1M': growthPct,
    '3M': 14.2,
    '1Y': 48.0,
    'ALL': 112.5
  };

  const currentGrowth = periodGrowthMap[selectedPeriod] || growthPct;
  const periods = ['1W', '1M', '3M', '1Y', 'ALL'];

  const liquidSum = accounts.filter(a => a.type !== 'credit').reduce((acc, a) => acc + a.balance, 0);
  const creditSum = accounts.filter(a => a.type === 'credit').reduce((acc, a) => acc + a.balance, 0);

  return (
    <div className="w-full bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden select-none transition-colors duration-200">
      
      {/* Card Header & Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.06]">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Patrimonio Neto</span>
        </div>

        {/* Period Pills - Minimalist */}
        <div className="flex items-center space-x-0.5 bg-zinc-100 dark:bg-white/[0.04] p-0.5 rounded-lg border border-zinc-200 dark:border-white/[0.06]">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium transition-colors ${
                selectedPeriod === p 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold shadow-xs' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Net Worth Display */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2.5">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono tabular-nums">
              {formatMoney(displayCents)}
            </span>
            <div className="flex items-center space-x-1 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3" />
              <span>+{currentGrowth}%</span>
            </div>
          </div>

          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            {showBreakdown ? 'Ocultar' : 'Desglose'}
          </button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Activos líquidos menos pasivos corrientes</p>
      </div>

      {/* Account Breakdown Collapsible */}
      {showBreakdown && (
        <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.08] grid grid-cols-2 gap-2 animate-in fade-in duration-150">
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.04] space-y-0.5">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Liquidez en Cuentas</span>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 font-mono tabular-nums">
              ${liquidSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/[0.04] space-y-0.5">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Pasivos en Tarjeta</span>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 font-mono tabular-nums">
              ${creditSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

