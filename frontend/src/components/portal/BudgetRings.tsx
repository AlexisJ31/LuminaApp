import { useState } from 'react';
import { motion } from 'motion/react';
import { Edit3, Check, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export interface BudgetRingItem {
  id: string;
  category: string;
  emoji?: string;
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
    <div className="w-full bg-[#121824] border border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-2xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">Presupuestos por Categoría</h3>
          <p className="text-xs text-white/40">Anillos de progreso y límites mensuales (haz clic para editar)</p>
        </div>
        <span className="text-xs font-mono font-bold text-white/60">{ringItems.length} Categorías Activas</span>
      </div>

      {/* Grid of Category Rings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        {ringItems.map((item: any) => {
          const spentCents = item.spentInCents ?? Math.round((item.spent || 0) * 100);
          const limitCents = item.limitInCents ?? Math.round((item.limit || 1) * 100);

          const pct = Math.min(100, Math.round((spentCents / limitCents) * 100));
          const isOver = spentCents > limitCents;
          const diffCents = Math.abs(limitCents - spentCents);

          const radius = 28;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (pct / 100) * circumference;
          const emojiIcon = item.emoji || '📦';

          return (
            <div 
              key={item.id} 
              className="relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/20 transition-all text-center space-y-2 group cursor-pointer"
            >
              {/* Edit Limit Trigger */}
              <button
                onClick={() => handleStartEdit(item.id, limitCents)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-emerald-400 transition-all"
                title="Editar Límite"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {/* Ring Circle */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#ffffff10"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Animated Progress Circle */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={isOver ? '#EF4444' : item.color}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Center Emoji Icon */}
                <span className="absolute text-xl group-hover:scale-110 transition-transform">
                  {emojiIcon}
                </span>
              </div>

              {/* Label & Status */}
              <div>
                <p className="text-xs font-semibold text-white truncate max-w-[100px] mx-auto">{item.category}</p>
                <span className={`text-[10px] font-mono font-bold block mt-0.5 ${
                  isOver ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {isOver ? `${formatMoney(diffCents)} over` : `${formatMoney(diffCents)} left`}
                </span>
                <span className="text-[9px] text-white/30 block mt-0.5 font-mono">
                  Límite: {formatMoney(limitCents)}
                </span>
              </div>

              {/* Inline Edit Popover */}
              {editingId === item.id && (
                <div className="absolute inset-0 z-20 bg-[#0E131F] border border-emerald-500/50 rounded-2xl p-3 flex flex-col justify-between shadow-2xl animate-in fade-in duration-150">
                  <span className="text-[10px] text-emerald-400 font-bold">Editar Límite ($)</span>
                  <input
                    type="number"
                    value={editLimitVal}
                    onChange={(e) => setEditLimitVal(e.target.value)}
                    autoFocus
                    className="w-full bg-white/10 border border-white/20 rounded-lg h-7 px-2 text-xs font-mono text-white text-center focus:outline-none focus:border-emerald-400"
                  />
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="flex-1 bg-emerald-500 text-black font-bold text-[10px] h-6 rounded flex items-center justify-center"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 bg-white/10 text-white text-[10px] h-6 rounded flex items-center justify-center"
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
