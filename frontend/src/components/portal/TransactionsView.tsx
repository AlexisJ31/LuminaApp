import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Download, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, RefreshCw, FileText, Trash2
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export default function TransactionsView() {
  const { transactions: liveTransactions, deleteTransaction } = useFinance();

  // State filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREVIEWED' | 'REVIEWED' | 'REJECTED'>('ALL');

  // Filtered transactions computation
  const filteredTransactions = useMemo(() => {
    return liveTransactions.filter((tx) => {
      // Type Filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      // Status Filter
      if (statusFilter !== 'ALL') {
        const txStatus = tx.status === 'confirmed' ? 'REVIEWED' : 'UNREVIEWED';
        if (txStatus !== statusFilter) return false;
      }
      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchDesc = tx.title.toLowerCase().includes(query);
        const matchCat = (tx.category || '').toLowerCase().includes(query);
        const matchNotes = (tx.sourceNotes || '').toLowerCase().includes(query);
        return matchDesc || matchCat || matchNotes;
      }
      return true;
    });
  }, [liveTransactions, typeFilter, statusFilter, searchTerm]);

  // Summary Metrics
  const stats = useMemo(() => {
    let incomeDollars = 0;
    let expenseDollars = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'INCOME') incomeDollars += tx.amount;
      if (tx.type === 'EXPENSE') expenseDollars += tx.amount;
    });

    return {
      count: filteredTransactions.length,
      income: incomeDollars.toLocaleString('es-PA', { style: 'currency', currency: 'USD' }),
      expense: expenseDollars.toLocaleString('es-PA', { style: 'currency', currency: 'USD' }),
      net: (incomeDollars - expenseDollars).toLocaleString('es-PA', { style: 'currency', currency: 'USD' }),
      netValue: incomeDollars - expenseDollars
    };
  }, [filteredTransactions]);

  // CSV Export Handler
  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Descripción', 'Categoría', 'Tipo', 'Estado', 'Monto ($)'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      new Date(tx.date).toLocaleDateString('es-PA'),
      `"${(tx.title || tx.description || 'Gasto').replace(/"/g, '""')}"`,
      `"${(tx.category || tx.categoryId || 'General').replace(/"/g, '""')}"`,
      tx.type,
      tx.status,
      (tx.amountInCents ? tx.amountInCents / 100 : tx.amount).toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transacciones_lumina_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            <span>Historial de Movimientos</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Registro unificado de transacciones, clasificación y conciliación fiscal
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="self-start sm:self-auto flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-white/[0.08] transition-all active:scale-95 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* KPI Stats Bar - Mercury / Linear Minimalist Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Transacciones</span>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono mt-1 tabular-nums">{stats.count}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Ingresos Totales</span>
          <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center tabular-nums">
            <ArrowUpRight className="w-4 h-4 mr-1 shrink-0" />
            {stats.income}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Gastos Totales</span>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-200 font-mono mt-1 flex items-center tabular-nums">
            <ArrowDownRight className="w-4 h-4 mr-1 shrink-0 text-rose-500" />
            {stats.expense}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Balance Neto</span>
          <p className={`text-xl font-semibold font-mono mt-1 tabular-nums ${stats.netValue >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            {stats.net}
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#12141C] border border-zinc-200 dark:border-white/[0.08]">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por comercio, notas o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-white/20 transition-all font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer font-sans"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="EXPENSE">Gastos (-)</option>
            <option value="INCOME">Ingresos (+)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer font-sans"
          >
            <option value="ALL">Todos los estados</option>
            <option value="REVIEWED">Revisados</option>
            <option value="UNREVIEWED">Por Revisar</option>
            <option value="REJECTED">Rechazados</option>
          </select>

          {/* Clear Filters */}
          {(searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }}
              className="p-1.5 text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center space-x-1"
              title="Limpiar Filtros"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

        </div>
      </div>

      {/* Table Container - Clean Linear Rows */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#12141C] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono select-none">
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Descripción</th>
                <th className="py-2.5 px-4">Categoría</th>
                <th className="py-2.5 px-4">Origen</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Monto</th>
                <th className="py-2.5 px-4 text-center">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04] text-xs text-zinc-700 dark:text-zinc-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                    No se encontraron transacciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredTransactions.map((tx) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Description & Notes */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{tx.title}</div>
                        {tx.sourceNotes && <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-xs">{tx.sourceNotes}</div>}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.06]">
                          {tx.category || 'GENERAL'}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                        {tx.id.includes('approved') ? (
                          <span className="text-zinc-500 dark:text-zinc-400">Webhook n8n</span>
                        ) : (
                          <span>Manual</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirmado</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className={`py-3 px-4 text-right font-mono font-medium whitespace-nowrap text-xs tabular-nums ${
                        tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {tx.amount.toLocaleString('es-PA', { style: 'currency', currency: 'USD' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors rounded hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          title="Eliminar Transacción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

