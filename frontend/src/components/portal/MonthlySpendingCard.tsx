import { useState } from 'react';
import { TrendingDown, TrendingUp, Edit3, Check, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface MonthlySpendingCardProps {
  monthLabel?: string;
  children?: React.ReactNode;
}

export default function MonthlySpendingCard({
  monthLabel = 'Septiembre 2026',
  children
}: MonthlySpendingCardProps) {
  const { totalSpent, budgetLimit, updateGlobalBudgetLimit } = useFinance();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editVal, setEditVal] = useState<string>('');

  const spentInCents = Math.round(totalSpent * 100);
  const budgetedInCents = Math.round(budgetLimit * 100);

  const diffInCents = Math.abs(budgetedInCents - spentInCents);
  const isUnder = spentInCents <= budgetedInCents;

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSaveBudget = () => {
    const parsed = parseFloat(editVal);
    if (!isNaN(parsed) && parsed > 0) {
      updateGlobalBudgetLimit(parsed);
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-2xl relative overflow-hidden select-none transition-colors duration-300">
      
      {/* Background Subtle Gradient Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        isUnder ? 'bg-emerald-500/5' : 'bg-rose-500/5'
      }`} />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/40">{monthLabel}</span>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Gasto Mensual Acumulado</h3>
        </div>

        {/* Pacing Anchor Badge (Servidor) */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-lg transition-all ${
          isUnder 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-rose-500/10'
        }`}>
          {isUnder ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
          <span>{formatMoney(diffInCents)} {isUnder ? 'bajo presupuesto' : 'sobre límite'}</span>
        </div>
      </div>

      {/* Main KPI Display */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            {formatMoney(spentInCents)}
          </span>

          {!isEditingBudget ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 dark:text-white/40">
                de {formatMoney(budgetedInCents)} presupuestados
              </span>
              <button
                onClick={() => { setIsEditingBudget(true); setEditVal(budgetLimit.toString()); }}
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all"
                title="Editar Presupuesto Mensual"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar Plan</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-xl border border-emerald-500/40">
              <span className="text-xs font-bold text-slate-600 dark:text-white/60">$</span>
              <input
                type="number"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveBudget(); }}
                className="w-24 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSaveBudget}
                className="px-2 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded-md hover:bg-emerald-400 flex items-center space-x-0.5"
              >
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Guardar</span>
              </button>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-white/50">
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
