import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, AlertTriangle, Check, X, Calendar, Repeat } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface BudgetAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthLabel?: string;
}

export default function BudgetAdjustmentModal({
  isOpen,
  onClose,
  monthLabel = 'Septiembre 2026'
}: BudgetAdjustmentModalProps) {
  const { budgetLimit, updateGlobalBudgetLimit } = useFinance();
  const [newBudgetStr, setNewBudgetStr] = useState<string>('');
  const [scope, setScope] = useState<'THIS_MONTH' | 'PERMANENT'>('THIS_MONTH');

  const now = new Date();
  const totalDaysInMonth = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }, [now]);

  useEffect(() => {
    if (isOpen) {
      setNewBudgetStr(budgetLimit.toString());
      setScope('THIS_MONTH');
    }
  }, [isOpen, budgetLimit]);

  const parsedNewBudget = parseFloat(newBudgetStr) || 0;

  // Financial calculations for live impact
  const currentDailyPace = budgetLimit / totalDaysInMonth;
  const newDailyPace = parsedNewBudget / totalDaysInMonth;
  const dailyPaceDiff = newDailyPace - currentDailyPace;

  // Net Income baseline (estimated from Panama profile $801.00)
  const estimatedNetIncome = 801.00;
  const isExceedingIncome = parsedNewBudget > estimatedNetIncome;

  const handleSave = () => {
    if (parsedNewBudget > 0) {
      updateGlobalBudgetLimit(parsedNewBudget);
      onClose();
    }
  };

  const presets = [500, 800, 1000, 1200, 1500];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
        
        {/* Backdrop click dismiss */}
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Window Container - Linear Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors duration-200"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-white/[0.08]">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  Ajustar Límite Global
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Rebalanceo para {monthLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Input & Presets */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Presupuesto Mensual
              </label>
              
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xl font-medium font-mono text-zinc-400 dark:text-zinc-500">$</span>
                <input
                  type="number"
                  value={newBudgetStr}
                  onChange={(e) => setNewBudgetStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.08] focus:border-zinc-400 dark:focus:border-white/20 rounded-xl py-2.5 pl-8 pr-4 text-xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all tabular-nums"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Valores:</span>
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNewBudgetStr(val.toString())}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                      parsedNewBudget === val
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold'
                        : 'bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Financial Impact Card */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] space-y-2.5">
              <h4 className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Impacto en Ritmo Diario</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Pacing</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.04] space-y-0.5">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Ritmo Anterior</span>
                  <p className="text-xs font-semibold font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                    ${currentDailyPace.toFixed(2)} /día
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Nuevo Ritmo</span>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-xs font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ${newDailyPace.toFixed(2)}
                    </p>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      ({dailyPaceDiff >= 0 ? `+${dailyPaceDiff.toFixed(2)}` : dailyPaceDiff.toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Badge if exceeding income */}
              {isExceedingIncome && (
                <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-0.5 text-[11px]">
                    <p className="font-semibold">Excede el ingreso proyectado</p>
                    <p className="opacity-80 leading-tight">
                      El monto asignado (${parsedNewBudget.toFixed(2)}) supera tu ingreso neto mensual (${estimatedNetIncome.toFixed(2)}).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Scope Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Vigencia del Cambio
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  onClick={() => setScope('THIS_MONTH')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                    scope === 'THIS_MONTH'
                      ? 'bg-zinc-100 dark:bg-white/[0.08] border-zinc-400 dark:border-white/30 text-zinc-900 dark:text-white'
                      : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">Solo este mes</p>
                    <p className="text-[10px] opacity-75">Excepción para Septiembre 2026</p>
                  </div>
                </div>

                <div
                  onClick={() => setScope('PERMANENT')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                    scope === 'PERMANENT'
                      ? 'bg-zinc-100 dark:bg-white/[0.08] border-zinc-400 dark:border-white/30 text-zinc-900 dark:text-white'
                      : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">Permanente</p>
                    <p className="text-[10px] opacity-75">Aplica a meses futuros</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 p-3.5 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all"
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={handleSave}
              disabled={parsedNewBudget <= 0}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Guardar</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

