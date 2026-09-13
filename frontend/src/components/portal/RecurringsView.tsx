import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, CreditCard, Plus, CheckCircle, Zap, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export interface RecurringBill {
  id: string;
  name: string;
  category: string;
  amount: number; // in USD decimal
  billingCycle: 'MONTHLY' | 'YEARLY';
  nextBillingDate: string; // YYYY-MM-DD
  paymentMethod: string;
  status: 'ACTIVE' | 'PAUSED';
}

export default function RecurringsView() {
  const { recurrings, addRecurring, removeRecurring, toggleRecurringStatus } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Entretenimiento');

  const handleRemove = (id: string) => {
    removeRecurring(id);
  };

  // Compute total monthly commitment
  const totalMonthlyCommitment = recurrings.reduce((sum, item: any) => {
    if (item.status === 'PAUSED') return sum;
    const cycle = item.billingCycle || item.frequency;
    return sum + (cycle === 'YEARLY' ? item.amount / 12 : item.amount);
  }, 0);

  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    addRecurring({
      name: newName,
      category: newCategory,
      amount: parseFloat(newAmount),
      frequency: 'MENSUAL',
      dueDate: new Date(Date.now() + 86400000 * 15).toISOString().slice(0, 10),
      autoPay: true,
      status: 'ACTIVE' as any,
      billingCycle: 'MONTHLY',
      nextBillingDate: new Date(Date.now() + 86400000 * 15).toISOString().slice(0, 10),
      paymentMethod: 'Tarjeta Débito Principal'
    });

    setNewName('');
    setNewAmount('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            <span>Suscripciones y Gastos Fijos</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
            Gestiona tus cobros recurrentes y prevé el impacto financiero mensual.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Nueva Suscripción</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 border border-purple-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Compromiso Mensual Fijo</span>
            </span>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ${totalMonthlyCommitment.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-normal text-white/50 ml-1">/ mes</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
            <div>
              <div className="text-xs text-white/50">Cobros este mes</div>
              <div className="text-lg font-bold text-white">{recurrings.length} suscripciones</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-xs text-white/50">Próximo Cobro</div>
              <div className="text-xs font-semibold text-emerald-400">En 3 días (Netflix)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Recurrings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {recurrings.map((bill: any) => {
            const isAct = bill.status === 'ACTIVE' || bill.status === 'PAID' || bill.status !== 'PAUSED';
            const cycleLabel = (bill.billingCycle || bill.frequency || 'mensual').toLowerCase();
            const dueDateLabel = bill.nextBillingDate || bill.dueDate || 'Próximo mes';
            const methodLabel = bill.paymentMethod || 'Tarjeta Débito';

            return (
              <motion.div
                key={bill.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-3 relative group shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                      {bill.category}
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white mt-1 text-sm">{bill.name}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      ${typeof bill.amount === 'number' ? bill.amount.toFixed(2) : bill.amount}
                    </span>
                    <div className="text-[10px] text-slate-400 dark:text-white/40 capitalize">{cycleLabel}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-white/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-white/40">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Próximo cobro:</span>
                    </span>
                    <span className="font-semibold text-emerald-500 dark:text-emerald-400 text-[11px]">
                      {dueDateLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-white/40">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Método:</span>
                    </span>
                    <span className="text-[11px] truncate max-w-[140px] text-slate-700 dark:text-white/80">
                      {methodLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleRecurringStatus(bill.id)}
                    className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
                      isAct
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                    }`}
                    title="Haz clic para Pausar / Reactivar"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>{isAct ? 'Activo' : 'Pausado'}</span>
                  </button>

                  <button
                    onClick={() => handleRemove(bill.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 dark:text-white/30 dark:hover:text-rose-400 transition-all"
                    title="Cancelar Suscripción"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Agregar Nueva Suscripción</h3>
            
            <form onSubmit={handleAddRecurring} className="space-y-3">
              <div>
                <label className="text-xs text-white/60">Nombre del Servicio / Gasto</label>
                <input
                  type="text"
                  placeholder="Ej: Spotify, Gimnasio, Agua"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-white/60">Monto Mensual ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="12.99"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-white/60">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121824] border border-white/10 text-white text-xs focus:outline-none"
                >
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Vivienda">Vivienda</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Salud">Salud</option>
                  <option value="Educación">Educación</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 text-xs font-semibold shadow-lg shadow-purple-500/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
