import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Download, CheckCircle2, XCircle, Clock, 
  ArrowUpRight, ArrowDownRight, RefreshCw, FileText
} from 'lucide-react';
import { useTransactions, type Transaction } from '../../hooks/useTransactions';

// Initial Mock Dataset for fallback when API has no records
const FALLBACK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    userId: 'usr-1',
    accountId: 'acc-credit-1',
    categoryId: 'Alimentación / Supermercado',
    amountInCents: 14580,
    type: 'EXPENSE',
    status: 'REVIEWED',
    source: 'MANUAL',
    description: 'Riba Smith Costa del Este',
    notes: 'Compra de víveres semanales',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-102',
    userId: 'usr-1',
    accountId: 'acc-debit-1',
    categoryId: 'Nómina / Salario',
    amountInCents: 285000,
    type: 'INCOME',
    status: 'REVIEWED',
    source: 'MANUAL',
    description: 'Pago de Nómina Quincenal',
    notes: 'Depósito directo Banco General',
    date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-103',
    userId: 'usr-1',
    accountId: 'acc-credit-1',
    categoryId: 'Restaurantes y Salidas',
    amountInCents: 4500,
    type: 'EXPENSE',
    status: 'UNREVIEWED',
    source: 'WEBHOOK_N8N',
    description: 'Uber Eats - Sushi Market',
    notes: 'Capta automatizada vía WhatsApp n8n',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-104',
    userId: 'usr-1',
    accountId: 'acc-debit-1',
    categoryId: 'Servicios Básicos',
    amountInCents: 6820,
    type: 'EXPENSE',
    status: 'REVIEWED',
    source: 'MANUAL',
    description: 'Naturgy Energía Eléctrica',
    notes: 'Pago mensual de luz',
    date: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-105',
    userId: 'usr-1',
    accountId: 'acc-debit-1',
    categoryId: 'Ventas / Freelance',
    amountInCents: 35000,
    type: 'INCOME',
    status: 'REVIEWED',
    source: 'MANUAL',
    description: 'Proyecto Web Consulting',
    notes: 'Honorarios cliente Panamá',
    date: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-106',
    userId: 'usr-1',
    accountId: 'acc-credit-1',
    categoryId: 'Entretenimiento',
    amountInCents: 1599,
    type: 'EXPENSE',
    status: 'REVIEWED',
    source: 'IMPORT',
    description: 'Netflix HD suscripción',
    notes: 'Cobro recurrente de tarjeta',
    date: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function TransactionsView() {
  const { transactions: apiTransactions, reviewTransaction, isLoading } = useTransactions();

  // State filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREVIEWED' | 'REVIEWED' | 'REJECTED'>('ALL');

  // Merged transactions (API data + fallback mock items if API empty)
  const allTransactions = useMemo(() => {
    if (apiTransactions && apiTransactions.length > 0) {
      return apiTransactions;
    }
    return FALLBACK_TRANSACTIONS;
  }, [apiTransactions]);

  // Filtered transactions computation
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type Filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      // Status Filter
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(query);
        const matchCat = (tx.categoryId || '').toLowerCase().includes(query);
        const matchNotes = (tx.notes || '').toLowerCase().includes(query);
        return matchDesc || matchCat || matchNotes;
      }
      return true;
    });
  }, [allTransactions, typeFilter, statusFilter, searchTerm]);

  // Summary Metrics
  const stats = useMemo(() => {
    let incomeCents = 0;
    let expenseCents = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'INCOME') incomeCents += tx.amountInCents;
      if (tx.type === 'EXPENSE') expenseCents += tx.amountInCents;
    });

    return {
      count: filteredTransactions.length,
      income: (incomeCents / 100).toLocaleString('es-PA', { style: 'currency', currency: 'USD' }),
      expense: (expenseCents / 100).toLocaleString('es-PA', { style: 'currency', currency: 'USD' }),
      net: ((incomeCents - expenseCents) / 100).toLocaleString('es-PA', { style: 'currency', currency: 'USD' }),
      netValue: incomeCents - expenseCents
    };
  }, [filteredTransactions]);

  // CSV Export Handler
  const exportCSV = () => {
    const headers = ['ID', 'Fecha', 'Descripción', 'Categoría', 'Tipo', 'Estado', 'Monto ($)'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      new Date(tx.date).toLocaleDateString('es-PA'),
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${(tx.categoryId || 'General').replace(/"/g, '""')}"`,
      tx.type,
      tx.status,
      (tx.amountInCents / 100).toFixed(2)
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
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Historial de Transacciones</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
            Consulta, filtra y exporta tus ingresos y gastos registrados.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white dark:bg-white/10 dark:hover:bg-white/20 text-xs font-semibold border border-white/10 transition-all active:scale-95 shadow-md"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <span className="text-[11px] font-medium text-slate-500 dark:text-white/40 uppercase tracking-wider">Transacciones</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.count}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <span className="text-[11px] font-medium text-slate-500 dark:text-white/40 uppercase tracking-wider">Ingresos Totales</span>
          <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 mt-1 flex items-center">
            <ArrowUpRight className="w-5 h-5 mr-1" />
            {stats.income}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <span className="text-[11px] font-medium text-slate-500 dark:text-white/40 uppercase tracking-wider">Gastos Totales</span>
          <p className="text-2xl font-bold text-rose-500 dark:text-rose-400 mt-1 flex items-center">
            <ArrowDownRight className="w-5 h-5 mr-1" />
            {stats.expense}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <span className="text-[11px] font-medium text-slate-500 dark:text-white/40 uppercase tracking-wider">Balance Neto</span>
          <p className={`text-2xl font-bold mt-1 ${stats.netValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.net}
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Buscar por comercio, categoría o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-1 md:pb-0">
          
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#121824] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="EXPENSE">Gastos (-)</option>
            <option value="INCOME">Ingresos (+)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#121824] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="REVIEWED">Revisados</option>
            <option value="UNREVIEWED">Por Revisar</option>
            <option value="REJECTED">Rechazados</option>
          </select>

          {/* Clear Filters */}
          {(searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }}
              className="p-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center space-x-1"
              title="Limpiar Filtros"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 font-semibold select-none">
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Origen</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Monto</th>
                <th className="py-3.5 px-4 text-center">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs text-slate-700 dark:text-white/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-white/40">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-emerald-400" />
                    Cargando transacciones...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-white/40">
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
                      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-white/50 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Description & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{tx.description}</div>
                        {tx.notes && <div className="text-[10px] text-slate-400 dark:text-white/40 truncate max-w-xs">{tx.notes}</div>}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 font-medium text-[11px]">
                          {tx.categoryId || 'General'}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500 dark:text-white/40">
                        {tx.source === 'WEBHOOK_N8N' && <span className="text-purple-400 font-semibold">⚡ n8n Webhook</span>}
                        {tx.source === 'MANUAL' && <span>✍️ Manual</span>}
                        {tx.source === 'IMPORT' && <span>📄 Importado</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.status === 'REVIEWED' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Revisado</span>
                          </span>
                        )}
                        {tx.status === 'UNREVIEWED' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Por Revisar</span>
                          </span>
                        )}
                        {tx.status === 'REJECTED' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
                            <XCircle className="w-3 h-3" />
                            <span>Rechazado</span>
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className={`py-3.5 px-4 text-right font-bold whitespace-nowrap text-sm ${
                        tx.type === 'INCOME' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {(tx.amountInCents / 100).toLocaleString('es-PA', { style: 'currency', currency: 'USD' })}
                      </td>

                      {/* Quick Review Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {tx.status === 'UNREVIEWED' && (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => reviewTransaction({ id: tx.id, status: 'REVIEWED' })}
                              className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 transition-colors"
                              title="Aprobar Transacción"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => reviewTransaction({ id: tx.id, status: 'REJECTED' })}
                              className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 transition-colors"
                              title="Rechazar Transacción"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
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
