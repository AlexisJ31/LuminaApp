import { useState } from 'react';
import { motion } from 'motion/react';
import { Sliders, Check, X, ShoppingBag, Utensils, Tv, Bus, Package } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export interface BudgetRingItem {
  id: string;
  category: string;
  spentInCents: number;
  limitInCents: number;
  color: string;
}

export default function BudgetRings({ items }: { items?: BudgetRingItem[] }) {
  const { budgets, updateBudgetLimit } = useFinance();
  const ringItems = items || budgets;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState<string>('');

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = categoryName.toLowerCase();
    if (cat.includes('alimentación') || cat.includes('super')) return <ShoppingBag className="w-4 h-4" />;
    if (cat.includes('restaurante') || cat.includes('delivery')) return <Utensils className="w-4 h-4" />;
    if (cat.includes('entretenimiento') || cat.includes('streaming')) return <Tv className="w-4 h-4" />;
    if (cat.includes('transporte') || cat.includes('gasolina')) return <Bus className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const handleStartEdit = (id: string, currentLimitCents: number) => {
    setEditingId(id);
    setEditLimitVal((currentLimitCents / 100).toString());
  };

  const handleSaveEdit = (id: string) => {
    const parsed = parseFloat(editLimitVal);
    if (!isNaN(parsed) && parsed > 0) {
      updateBudgetLimit(id, Math.round(parsed * 100));
    }
    setEditingId(null);
  };

  return (
    <div className="w-full bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm select-none transition-colors duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Presupuestos por Categoría
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Control de asignación mensual y monitoreo de desviación
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          {ringItems.length} Categorías
        </span>
      </div>

      {/* Grid of Category Budget Meters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {ringItems.map((item: any) => {
          const spentCents = item.spentInCents ?? Math.round((item.spent || 0) * 100);
          const limitCents = item.limitInCents ?? Math.round((item.limit || 1) * 100);

          const pct = Math.min(100, Math.round((spentCents / limitCents) * 100));
          const isOver = spentCents > limitCents;
          const diffCents = Math.abs(limitCents - spentCents);

          const radius = 24;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (pct / 100) * circumference;

          return (
            <div 
              key={item.id} 
              className="relative flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-50/70 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.04] hover:border-zinc-300 dark:hover:border-white/[0.12] transition-all text-center space-y-2 group cursor-pointer"
            >
              {/* Edit Limit Trigger */}
              <button
                onClick={() => handleStartEdit(item.id, limitCents)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 transition-all"
                title="Editar Límite"
              >
                <Sliders className="w-3 h-3" />
              </button>

              {/* Ring Circle - Precision Vector */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    className="stroke-zinc-200 dark:stroke-white/[0.06]"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke={isOver ? '#EF4444' : '#10B981'}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Center Icon */}
                <div 
                  className="absolute p-1.5 rounded-full text-zinc-700 dark:text-zinc-300"
                >
                  {getCategoryIcon(item.category)}
                </div>
              </div>

              {/* Label & Status */}
              <div>
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate max-w-[105px] mx-auto">
                  {item.category}
                </p>
                <span className={`text-[10px] font-mono font-medium block mt-0.5 tabular-nums ${
                  isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {isOver ? `+${formatMoney(diffCents)} exc.` : `${formatMoney(diffCents)} disp.`}
                </span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-0.5 font-mono">
                  Tope: {formatMoney(limitCents)}
                </span>
              </div>

              {/* Inline Edit Popover */}
              {editingId === item.id && (
                <div className="absolute inset-0 z-20 bg-white dark:bg-[#12141C] border border-zinc-300 dark:border-white/20 rounded-xl p-2.5 flex flex-col justify-between shadow-xl animate-in fade-in duration-100">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Nuevo Límite ($)</span>
                  <input
                    type="number"
                    value={editLimitVal}
                    onChange={(e) => setEditLimitVal(e.target.value)}
                    autoFocus
                    className="w-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.1] rounded-md h-6 px-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 text-center focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="flex-1 bg-emerald-500 text-zinc-950 font-bold text-[10px] h-5 rounded flex items-center justify-center hover:bg-emerald-400 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 bg-zinc-200 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-[10px] h-5 rounded flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-white/[0.12] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

