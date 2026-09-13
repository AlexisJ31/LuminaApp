import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Calendar, Tag, CreditCard, FileText, CheckCircle2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'cat-groc', name: 'Supermercado 🥑', icon: '🥑' },
  { id: 'cat-rest', name: 'Restaurantes 🍔', icon: '🍔' },
  { id: 'cat-trans', name: 'Transporte 🚗', icon: '🚗' },
  { id: 'cat-sub', name: 'Subscripciones 🎬', icon: '🎬' },
  { id: 'cat-[#080A0F]', name: 'Servicios Básicos 💡', icon: '💡' },
  { id: 'cat-salary', name: 'Nómina / Salario 💰', icon: '💰' },
  { id: 'cat-gen', name: 'General / Varios 📦', icon: '📦' }
];

const ACCOUNTS = [
  { id: 'acc-debit-1', name: 'Banco General Débito', balance: '$1,420.50' },
  { id: 'acc-credit-1', name: 'BAC Visa Crédito', balance: '$680.00' },
  { id: 'acc-cash-1', name: 'Efectivo Panamá', balance: '$150.00' }
];

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { createTransaction, isCreating } = useTransactions();

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('cat-groc');
  const [accountId, setAccountId] = useState<string>('acc-debit-1');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Por favor ingresa un monto válido mayor a $0.00');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor ingresa un nombre o descripción del gasto');
      return;
    }

    try {
      await createTransaction({
        description: description.trim(),
        amount: parsedAmount,
        amountInCents: Math.round(parsedAmount * 100),
        type,
        categoryId,
        accountId,
        notes: notes.trim(),
        date: new Date(date).toISOString()
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset form
        setAmount('');
        setDescription('');
        setNotes('');
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar la transacción');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        
        {/* Backdrop animation click to close */}
        <motion.div 
          className="absolute inset-0 z-0" 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Card */}
        <motion.div 
          className="relative z-10 w-full max-w-lg bg-[#0E131F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Captura Rápida 1-Tap</span>
              <h3 className="text-xl font-bold tracking-tight">Registrar Transacción</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Overlay Feedback */}
          {isSuccess ? (
            <motion.div 
              className="py-12 flex flex-col items-center justify-center space-y-4 text-emerald-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 className="w-16 h-16 animate-bounce" />
              <span className="text-lg font-bold text-white">¡Transacción Registrada Exitosamente!</span>
              <span className="text-xs text-white/50">Actualizando tu Pacing Engine e Historial...</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Type Switcher Tabs (Gasto / Ingreso) */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    type === 'EXPENSE'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Gasto (- Estatus)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    type === 'INCOME'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Ingreso (+ Saldo)</span>
                </button>
              </div>

              {/* Amount Input Block */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Monto ($ USD / PAB)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-mono text-white/40">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 rounded-2xl h-14 pl-9 pr-4 text-2xl font-mono font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nombre / Comercio / Descripción</span>
                </label>
                <input
                  type="text"
                  placeholder="ej. Supermercado Riba Smith, Uber, Starbucks"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 rounded-xl h-11 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* Category & Account Selectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Categoría</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#121824] border border-white/10 focus:border-emerald-500/50 rounded-xl h-11 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Account Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 flex items-center space-x-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cuenta de Origen</span>
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-[#121824] border border-white/10 focus:border-emerald-500/50 rounded-xl h-11 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    {ACCOUNTS.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance})</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fecha de Transacción</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#121824] border border-white/10 focus:border-emerald-500/50 rounded-xl h-11 px-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs animate-shake">
                  {errorMessage}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-[2] h-12 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <span>Guardando...</span>
                  ) : (
                    <span>Guardar Transacción</span>
                  )}
                </button>
              </div>

            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
