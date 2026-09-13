import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, CheckCheck, Sparkles } from 'lucide-react';

export interface UnreviewedTx {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  categoryBadgeColor: string;
  dateLabel: string;
  sourceNotes?: string;
}

const initialUnreviewed: UnreviewedTx[] = [
  {
    id: 'tx-101',
    description: 'Apple Music',
    amountInCents: 1099, // $10.99
    category: 'SUBSCRIPTIONS',
    categoryBadgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    dateLabel: 'HOY',
    sourceNotes: 'Inyectado por n8n desde correo bancario'
  },
  {
    id: 'tx-102',
    description: 'Supermercado Riba Smith',
    amountInCents: 3286, // $32.86
    category: 'GROCERIES',
    categoryBadgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    dateLabel: 'HOY',
    sourceNotes: 'Notificación de compra con tarjeta débito'
  },
  {
    id: 'tx-103',
    description: 'Uber Panamá',
    amountInCents: 2135, // $21.35
    category: 'TRANSPORTATION',
    categoryBadgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    dateLabel: 'HOY',
    sourceNotes: 'Ingresado pasivamente por webhook'
  },
  {
    id: 'tx-104',
    description: 'Film Noir Cinemas',
    amountInCents: 1799, // $17.99
    category: 'ENTERTAINMENT',
    categoryBadgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    dateLabel: 'AYER'
  },
  {
    id: 'tx-105',
    description: "Eden's Salads",
    amountInCents: 1512, // $15.12
    category: 'RESTAURANTS',
    categoryBadgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    dateLabel: 'AYER'
  }
];

interface TransactionsReviewCardProps {
  onAllReviewed?: () => void;
}

export default function TransactionsReviewCard({ onAllReviewed }: TransactionsReviewCardProps) {
  const [items, setItems] = useState<UnreviewedTx[]>(initialUnreviewed);
  const [confirmedCount, setConfirmedCount] = useState<number>(0);

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleConfirmSingle = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setConfirmedCount((c) => c + 1);
  };

  const handleConfirmAll = () => {
    const total = items.length;
    setConfirmedCount((c) => c + total);
    setItems([]);
    if (onAllReviewed) onAllReviewed();
  };

  return (
    <div className="w-full bg-[#121824] border border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-5 shadow-2xl">
      
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Gastos por Revisar</h3>
            <p className="text-xs text-white/40">Inyectados automáticamente por n8n & webhooks</p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleConfirmAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-all active:scale-95"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Aprobar todos ({items.length})</span>
          </button>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-3 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-sm font-semibold text-white">¡Todo al día!</h4>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                No hay transacciones pendientes en tu bandeja de entrada. Has confirmado {confirmedCount} gastos.
              </p>
            </motion.div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, height: 0 }}
                transition={{ duration: 0.25 }}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all"
              >
                {/* Description & Badge */}
                <div className="flex items-center space-x-3 truncate mr-2">
                  <button 
                    onClick={() => handleConfirmSingle(item.id)}
                    className="w-7 h-7 rounded-xl bg-white/5 group-hover:bg-emerald-500/20 text-white/40 group-hover:text-emerald-400 border border-white/10 flex items-center justify-center transition-all shrink-0 active:scale-90"
                    title="Aprobar gasto"
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white truncate">{item.description}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${item.categoryBadgeColor}`}>
                        {item.category}
                      </span>
                    </div>
                    {item.sourceNotes ? (
                      <p className="text-[11px] text-white/40 truncate">{item.sourceNotes}</p>
                    ) : (
                      <p className="text-[11px] text-white/30">{item.dateLabel}</p>
                    )}
                  </div>
                </div>

                {/* Amount & Quick Confirm */}
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="font-mono text-xs font-bold text-white">
                    {formatMoney(item.amountInCents)}
                  </span>
                  
                  <button
                    onClick={() => handleConfirmSingle(item.id)}
                    className="hidden sm:flex items-center space-x-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95"
                  >
                    <span>Confirmar</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
