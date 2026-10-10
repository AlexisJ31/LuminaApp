import { useState } from 'react';
import { TrendingDown, TrendingUp, Sliders } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import BudgetAdjustmentModal from './BudgetAdjustmentModal';

interface MonthlySpendingCardProps {
  monthLabel?: string;
  children?: React.ReactNode;
}

export default function MonthlySpendingCard({
  monthLabel = 'Septiembre 2026',
  children
}: MonthlySpendingCardProps) {
  const { totalSpent, budgetLimit } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const spentInCents = Math.round(totalSpent * 100);
  const budgetedInCents = Math.round(budgetLimit * 100);

  // Expected pacing up to today
  const expectedPacingToTodayCents = Math.round(((budgetLimit / totalDaysInMonth) * currentDay) * 100);
  const pacingDiffCents = Math.abs(expectedPacingToTodayCents - spentInCents);
  const isUnderPacing = spentInCents <= expectedPacingToTodayCents;

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <BudgetAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        monthLabel={monthLabel}
      />

      <div className="w-full bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden select-none transition-colors duration-200">
        
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {monthLabel} · Pacing Engine
            </span>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Gasto Mensual Acumulado
            </h3>
          </div>

          {/* Pacing Anchor Badge */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-all ${
            isUnderPacing 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}>
            {isUnderPacing ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            <span>{formatMoney(pacingDiffCents)} {isUnderPacing ? 'bajo ritmo' : 'sobre ritmo'}</span>
          </div>
        </div>

        {/* Main KPI Display */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono tabular-nums">
              {formatMoney(spentInCents)}
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                / {formatMoney(budgetedInCents)}
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white px-2 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-200 dark:hover:bg-white/[0.08] active:scale-95 transition-all"
                title="Ajustar Presupuesto"
              >
                <Sliders className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                <span>Ajustar Plan</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Registrado al Día {currentDay} de {totalDaysInMonth} (Zona horaria Panamá UTC-5)
          </p>
        </div>

        {/* Spline Chart Container slot */}
        {children && (
          <div className="pt-2">
            {children}
          </div>
        )}

      </div>
    </>
  );
}

