import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, CheckCheck, Inbox } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export interface UnreviewedTx {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  categoryBadgeColor: string;
  dateLabel: string;
  sourceNotes?: string;
}

interface TransactionsReviewCardProps {
  onAllReviewed?: () => void;
}

export default function TransactionsReviewCard({ onAllReviewed }: TransactionsReviewCardProps) {
  const { unreviewedItems, confirmUnreviewedSingle, confirmAllUnreviewed, rejectUnreviewedSingle } = useFinance();
  const [confirmedCount, setConfirmedCount] = useState<number>(0);

  const items = unreviewedItems;

  const formatMoney = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleConfirmSingle = (id: string) => {
    confirmUnreviewedSingle(id);
    setConfirmedCount((c) => c + 1);
  };

  const handleConfirmAll = () => {
    const total = items.length;
    confirmAllUnreviewed();
    setConfirmedCount((c) => c + total);
    if (onAllReviewed) onAllReviewed();
  };

  return (
    <div className="w-full bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm transition-colors duration-200">
      
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.06]">
            <Inbox className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Inbox de Revisión
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Movimientos detectados automáticamente por ingestión de extractos y webhooks
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleConfirmAll}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-white/[0.06] transition-all active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Aprobar lote ({items.length})</span>
          </button>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-2 bg-zinc-50 dark:bg-white/[0.01] border border-dashed border-zinc-200 dark:border-white/[0.06] rounded-xl"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Inbox al día</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                No hay movimientos pendientes de confirmación. {confirmedCount > 0 ? `${confirmedCount} movimientos conciliados recientemente.` : ''}
              </p>
            </motion.div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, height: 0 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-zinc-50/70 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.04] transition-all"
              >
                {/* Description & Badge */}
                <div className="flex items-center space-x-2.5 truncate mr-2">
                  <button 
                    onClick={() => handleConfirmSingle(item.id)}
                    className="w-6 h-6 rounded-md bg-white dark:bg-white/[0.04] group-hover:bg-emerald-500/10 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-500 border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center transition-all shrink-0 active:scale-90"
                    title="Aprobar gasto"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="truncate space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {item.description}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 border border-zinc-300/40 dark:border-white/[0.08]">
                        {item.category}
                      </span>
                    </div>
                    {item.sourceNotes ? (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">{item.sourceNotes}</p>
                    ) : (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">{item.dateLabel}</p>
                    )}
                  </div>
                </div>

                {/* Amount & Quick Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 mr-1 tabular-nums">
                    {formatMoney(item.amountInCents)}
                  </span>
                  
                  <button
                    onClick={() => rejectUnreviewedSingle(item.id)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all active:scale-95"
                    title="Descartar"
                  >
                    Descartar
                  </button>

                  <button
                    onClick={() => handleConfirmSingle(item.id)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95"
                  >
                    Confirmar
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

