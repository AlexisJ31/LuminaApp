import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Calendar, Tag, CreditCard, FileText, CheckCircle2, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { useFinance } from '../../context/FinanceContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryItem {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME' | 'BOTH';
}

interface AccountItem {
  id: string;
  name: string;
  balance: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  // Gastos
  { id: 'cat-groc', name: 'Supermercado 🥑', type: 'EXPENSE' },
  { id: 'cat-rest', name: 'Restaurantes 🍔', type: 'EXPENSE' },
  { id: 'cat-trans', name: 'Transporte 🚗', type: 'EXPENSE' },
  { id: 'cat-sub', name: 'Subscripciones 🎬', type: 'EXPENSE' },
  { id: 'cat-serv', name: 'Servicios Básicos 💡', type: 'EXPENSE' },
  { id: 'cat-exp-gen', name: 'Gastos Varios 📦', type: 'EXPENSE' },

  // Ingresos
  { id: 'cat-salary', name: 'Nómina / Salario 💰', type: 'INCOME' },
  { id: 'cat-sales', name: 'Ventas / Emprendimiento 🏷️', type: 'INCOME' },
  { id: 'cat-transf', name: 'Transferencias Entrantes 📲', type: 'INCOME' },
  { id: 'cat-refund', name: 'Reembolso / Cashback 💸', type: 'INCOME' },
  { id: 'cat-inc-gen', name: 'Otros Ingresos 📈', type: 'INCOME' }
];

const INITIAL_ACCOUNTS: AccountItem[] = [
  { id: 'acc-debit-1', name: 'Banco General Débito', balance: '$1,420.50' },
  { id: 'acc-credit-1', name: 'BAC Visa Crédito', balance: '$680.00' },
  { id: 'acc-cash-1', name: 'Efectivo Panamá', balance: '$150.00' }
];

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { createTransaction, isCreating } = useTransactions();
  const { addTransaction, addAccount, accounts: contextAccounts } = useFinance();

  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useState<AccountItem[]>(INITIAL_ACCOUNTS);

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('cat-groc');
  const [accountId, setAccountId] = useState<string>('acc-debit-1');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Dynamic creation states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync accounts from context if available
  const displayAccounts = contextAccounts.length > 0 
    ? contextAccounts.map(a => ({ id: a.id, name: a.name, balance: `$${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` }))
    : accounts;

  // Filtrar categorías dinámicamente según el tipo (Gasto vs Ingreso) para evitar contradicciones
  const availableCategories = categories.filter(c => c.type === type || c.type === 'BOTH');

  // Cambiar categoría por defecto al alternar tipo
  useEffect(() => {
    const firstCat = availableCategories[0];
    if (firstCat && !availableCategories.some(c => c.id === categoryId)) {
      setCategoryId(firstCat.id);
    }
  }, [type]);

  if (!isOpen) return null;

  // Sanitizar entrada de monto (evita números negativos o caracteres de guión '-')
  const handleAmountChange = (val: string) => {
    if (val.includes('-')) return;
    setAmount(val);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newId = `cat-custom-${Date.now()}`;
    const newCat: CategoryItem = { id: newId, name: `${newCatName.trim()} 🏷️`, type };
    setCategories(prev => [...prev, newCat]);
    setCategoryId(newId);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleAddAccount = () => {
    if (!newAccName.trim()) return;
    const initialBal = newAccBalance ? parseFloat(newAccBalance) : 0;
    addAccount({
      name: newAccName.trim(),
      type: 'CHECKING',
      balance: initialBal,
      currency: 'USD',
      accountNumberMasked: '••• ' + Math.floor(1000 + Math.random() * 9000)
    });

    const newId = `acc-custom-${Date.now()}`;
    const formattedBalance = `$${initialBal.toFixed(2)}`;
    const newAcc = { id: newId, name: newAccName.trim(), balance: formattedBalance };
    setAccounts(prev => [...prev, newAcc]);
    setAccountId(newId);
    setNewAccName('');
    setNewAccBalance('');
    setIsAddingAccount(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('El monto debe ser un valor positivo mayor a $0.00 (sin guiones o signos negativos).');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor ingresa un nombre o descripción de la transacción.');
      return;
    }

    const selectedCat = categories.find(c => c.id === categoryId)?.name || 'General';

    // Add to FinanceContext for instant client state update across all widgets
    addTransaction({
      merchant: description.trim(),
      description: description.trim(),
      amount: parsedAmount,
      amountInCents: Math.round(parsedAmount * 100),
      type,
      category: selectedCat,
      account: accountId,
      status: 'CONFIRMED',
      date: new Date(date).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' }),
      source: 'MANUAL'
    });

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
    } catch (_err) {
      // Backend may be offline in static deployment demo, FinanceContext already saved it!
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setAmount('');
      setDescription('');
      setNotes('');
    }, 800);
  };

  return (
    <AnimatePresence>
      {/* Full Fixed Viewport Overlay (fixed inset-0 h-screen w-screen z-[100]) */}
      <div className="fixed inset-0 z-[100] w-screen h-screen min-h-screen flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        
        {/* Backdrop click to close */}
        <motion.div 
          className="fixed inset-0 z-0 bg-black/60" 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content Card */}
        <motion.div 
          className="relative z-10 w-full max-w-lg bg-[#0E131F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white my-auto max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Captura Rápida 1-Tap</span>
              <h3 className="text-xl font-bold tracking-tight">Registrar Transacción</h3>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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

              {/* Type Switcher Tabs (Gasto vs Ingreso) */}
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
                  <span>Gasto (- Saldo)</span>
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

              {/* Amount Input (Enforced Positives) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Monto ($ USD / PAB)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">Valores positivos mayores a $0</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-mono text-white/40">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
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
                  placeholder={type === 'EXPENSE' ? 'ej. Supermercado Riba Smith, Uber, Starbucks' : 'ej. Pago de Nómina, Venta de Producto'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 rounded-xl h-11 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* Smart Category & Account Selectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category Selector (Filtered dynamically by Expense vs Income) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/60 flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Categoría ({type === 'EXPENSE' ? 'Gastos' : 'Ingresos'})</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nueva</span>
                    </button>
                  </div>

                  {isAddingCategory ? (
                    <div className="space-y-2 p-2 bg-white/5 border border-emerald-500/30 rounded-xl">
                      <input
                        type="text"
                        placeholder="Nombre de categoría..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg h-9 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="flex-1 bg-emerald-500 text-black font-bold text-[11px] h-7 rounded-md"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-2 bg-white/10 text-white text-[11px] h-7 rounded-md"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-[#121824] border border-white/10 focus:border-emerald-500/50 rounded-xl h-11 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      {availableCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Account / Card Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/60 flex items-center space-x-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cuenta / Tarjeta</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingAccount(!isAddingAccount)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nueva</span>
                    </button>
                  </div>

                  {isAddingAccount ? (
                    <div className="space-y-2 p-2 bg-white/5 border border-emerald-500/30 rounded-xl">
                      <input
                        type="text"
                        placeholder="ej. Yappy, Tarjeta Clave"
                        value={newAccName}
                        onChange={(e) => setNewAccName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg h-9 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Saldo inicial ($)..."
                        value={newAccBalance}
                        onChange={(e) => setNewAccBalance(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg h-9 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleAddAccount}
                          className="flex-1 bg-emerald-500 text-black font-bold text-[11px] h-7 rounded-md"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingAccount(false)}
                          className="px-2 bg-white/10 text-white text-[11px] h-7 rounded-md"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-[#121824] border border-white/10 focus:border-emerald-500/50 rounded-xl h-11 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      {displayAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance})</option>
                      ))}
                    </select>
                  )}
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

              {/* Error Alert */}
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
