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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
        
        {/* Backdrop click dismiss */}
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white transition-colors duration-300"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight text-slate-900 dark:text-white">Ajustar Plan de Presupuesto</h3>
                <p className="text-xs text-slate-500 dark:text-white/40 font-medium">Rebalanceo inteligente para {monthLabel}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Input & Presets */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider">
                Nuevo Presupuesto Mensual
              </label>
              
              <div className="relative flex items-center">
                <span className="absolute left-4 text-2xl font-bold font-mono text-slate-400 dark:text-white/30">$</span>
                <input
                  type="number"
                  value={newBudgetStr}
                  onChange={(e) => setNewBudgetStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl py-3 pl-10 pr-4 text-2xl font-extrabold font-mono text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-white/40">Sugeridos:</span>
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNewBudgetStr(val.toString())}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                      parsedNewBudget === val
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md scale-105'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Financial Impact Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider flex items-center justify-between">
                <span>Análisis de Impacto en Tiempo Real</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Live</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-white/40">Ritmo Diario Anterior</span>
                  <p className="text-sm font-bold font-mono text-slate-700 dark:text-white/80">
                    ${currentDailyPace.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans">/día</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Nuevo Ritmo Diario</span>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      ${newDailyPace.toFixed(2)}
                    </p>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ({dailyPaceDiff >= 0 ? `+${dailyPaceDiff.toFixed(2)}` : dailyPaceDiff.toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Badge if exceeding income */}
              {isExceedingIncome && (
                <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-[11px]">Advertencia de Déficit Presupuestario</p>
                    <p className="text-[10px] opacity-90 leading-tight">
                      Este presupuesto (${parsedNewBudget.toFixed(2)}) supera tu ingreso neto mensual estimado (${estimatedNetIncome.toFixed(2)}).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Scope Selection (This month vs Permanent) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-white/60 uppercase tracking-wider">
                Alcance del Ajuste
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* Option 1: Temporary exception */}
                <div
                  onClick={() => setScope('THIS_MONTH')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    scope === 'THIS_MONTH'
                      ? 'bg-emerald-500/10 border-emerald-500 dark:border-emerald-400 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Calendar className={`w-4 h-4 mt-0.5 shrink-0 ${scope === 'THIS_MONTH' ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  <div>
                    <p className="text-xs font-bold">Solo Septiembre 2026</p>
                    <p className="text-[10px] opacity-75">Excepción temporal para gastos de este mes</p>
                  </div>
                </div>

                {/* Option 2: Permanent rule */}
                <div
                  onClick={() => setScope('PERMANENT')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    scope === 'PERMANENT'
                      ? 'bg-emerald-500/10 border-emerald-500 dark:border-emerald-400 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Repeat className={`w-4 h-4 mt-0.5 shrink-0 ${scope === 'PERMANENT' ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  <div>
                    <p className="text-xs font-bold">Regla Permanente</p>
                    <p className="text-[10px] opacity-75">Aplica a todos los meses futuros</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-white/70 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={handleSave}
              disabled={parsedNewBudget <= 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black active:scale-[0.98] disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Confirmar y Aplicar</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
