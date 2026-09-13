import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';

export interface BudgetRingItem {
  id: string;
  category: string;
  emoji: string;
  spentInCents: number;
  limitInCents: number;
  color: string;
}

const defaultRings: BudgetRingItem[] = [
  {
    id: 'b-1',
    category: 'Supermercado',
    emoji: '🥑',
    spentInCents: 23675, // $236.75
    limitInCents: 30000, // $300.00
    color: '#10B981' // Emerald
  },
  {
    id: 'b-2',
    category: 'Restaurantes',
    emoji: '🍔',
    spentInCents: 18300, // $183.00
    limitInCents: 15000, // $150.00 (Over budget)
    color: '#F97316' // Orange
  },
  {
    id: 'b-3',
    category: 'Transporte',
    emoji: '🚗',
    spentInCents: 8500, // $85.00
    limitInCents: 12000, // $120.00
    color: '#3B82F6' // Blue
  },
  {
    id: 'b-4',
    category: 'Entretenimiento',
    emoji: '🎬',
    spentInCents: 4500, // $45.00
    limitInCents: 8000, // $80.00
    color: '#A855F7' // Purple
  }
];

interface BudgetRingsProps {
  items?: BudgetRingItem[];
}

export default function BudgetRings({ items }: BudgetRingsProps) {
  const { budgets } = useFinance();
  const ringItems = items || (budgets.length > 0 ? budgets : defaultRings);
  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="w-full bg-[#121824] border border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-2xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">Presupuestos por Categoría</h3>
          <p className="text-xs text-white/40">Anillos de progreso y límites mensuales</p>
        </div>
        <span className="text-xs font-mono font-bold text-white/60">{ringItems.length} Categorías Activas</span>
      </div>

      {/* Grid of Category Rings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        {ringItems.map((item) => {
          const pct = Math.min(100, Math.round((item.spentInCents / item.limitInCents) * 100));
          const isOver = item.spentInCents > item.limitInCents;
          const diffCents = Math.abs(item.limitInCents - item.spentInCents);

          const radius = 28;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (pct / 100) * circumference;

          return (
            <div 
              key={item.id} 
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all text-center space-y-2 group"
            >
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
                  {item.emoji}
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
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
