import { useState } from 'react';
import { TrendingDown, TrendingUp, Edit3 } from 'lucide-react';
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

      <div className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-2xl relative overflow-hidden select-none transition-colors duration-300">
        
        {/* Background Subtle Gradient Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          isUnderPacing ? 'bg-emerald-500/5' : 'bg-rose-500/5'
        }`} />

        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/40">{monthLabel}</span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Gasto Mensual Acumulado</h3>
          </div>

          {/* Pacing Anchor Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-lg transition-all ${
            isUnderPacing 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-rose-500/10'
          }`}>
            {isUnderPacing ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            <span>{formatMoney(pacingDiffCents)} {isUnderPacing ? 'bajo ritmo ideal' : 'sobre ritmo ideal'}</span>
          </div>
        </div>

        {/* Main KPI Display */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {formatMoney(spentInCents)}
            </span>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 dark:text-white/40">
                de {formatMoney(budgetedInCents)} presupuestados
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm"
                title="Ajustar Plan de Presupuesto Mensual"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ajustar Plan</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-white/50">
            Gasto real registrado al Día {currentDay} de {totalDaysInMonth} (UTC-5 Panamá)
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
