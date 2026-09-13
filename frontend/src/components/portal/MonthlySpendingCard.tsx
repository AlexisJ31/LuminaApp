import { TrendingDown, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface MonthlySpendingCardProps {
  monthLabel?: string;
  children?: React.ReactNode;
}

export default function MonthlySpendingCard({
  monthLabel = 'Septiembre 2026',
  children
}: MonthlySpendingCardProps) {
  const { totalSpent, budgetLimit } = useFinance();

  const spentInCents = Math.round(totalSpent * 100);
  const budgetedInCents = Math.round(budgetLimit * 100);

  const diffInCents = Math.abs(budgetedInCents - spentInCents);
  const isUnder = spentInCents <= budgetedInCents;
  const pacingStatus = isUnder ? 'UNDER' : 'OVER';

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full bg-[#121824] border border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-2xl relative overflow-hidden select-none">
      
      {/* Background Subtle Gradient Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        isUnder ? 'bg-emerald-500/5' : 'bg-rose-500/5'
      }`} />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{monthLabel}</span>
          <h3 className="text-base font-semibold text-white tracking-tight">Gasto Mensual Acumulado</h3>
        </div>

        {/* Pacing Anchor Badge (Servidor) */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-lg transition-all ${
          isUnder 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-rose-500/10'
        }`}>
          {isUnder ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
          <span>{formatMoney(diffInCents)} {isUnder ? 'bajo presupuesto' : 'sobre límite'}</span>
        </div>
      </div>

      {/* Main KPI Display */}
      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
            {formatMoney(spentInCents)}
          </span>
          <span className="text-xs text-white/40">
            de {formatMoney(budgetedInCents)} presupuestados
          </span>
        </div>
        <p className="text-xs text-white/50">
          Cálculo del ritmo de gasto procesado en tiempo real (UTC-5 Panamá)
        </p>
      </div>

      {/* Spline Chart Container slot */}
      {children && (
        <div className="pt-2">
          {children}
        </div>
      )}

    </div>
  );
}
