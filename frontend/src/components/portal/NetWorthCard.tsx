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
    <div className="w-full bg-[#121824] border border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-2xl relative overflow-hidden select-none">
      
      {/* Card Header & Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-white/70">Patrimonio Neto Total</span>
        </div>

        {/* Period Pills */}
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                selectedPeriod === p ? 'bg-white text-black' : 'text-white/40 hover:text-white'
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
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              {formatMoney(displayCents)}
            </span>
            <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" />
              <span>+{currentGrowth}%</span>
            </div>
          </div>

          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline"
          >
            {showBreakdown ? 'Ocultar' : 'Ver Desglose'}
          </button>
        </div>
        <p className="text-xs text-white/40">Consolidado de cuentas bancarias y liquidez en efectivo</p>
      </div>

      {/* Account Breakdown Collapsible */}
      {showBreakdown && (
        <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 animate-in fade-in duration-200">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-white/40 font-medium">Liquidez en Efectivo</span>
            <p className="text-sm font-bold text-emerald-400 font-mono">${liquidSum.toFixed(2)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-white/40 font-medium">Deuda en Tarjetas</span>
            <p className="text-sm font-bold text-amber-400 font-mono">${creditSum.toFixed(2)}</p>
          </div>
        </div>
      )}

    </div>
  );
}
