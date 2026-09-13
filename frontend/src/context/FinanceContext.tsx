import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TransactionItem {
  id: string;
  title: string;
  category: string;
  type: 'EXPENSE' | 'INCOME';
  amount: number; // in dollars (e.g. 10.99)
  date: string; // e.g. '2026-09-13'
  account: string;
  status: 'confirmed' | 'pending';
  sourceNotes?: string;
  categoryBadgeColor?: string;
}

export interface UnreviewedItem {
  id: string;
  description: string;
  amountInCents: number;
  category: string;
  categoryBadgeColor: string;
  dateLabel: string;
  sourceNotes?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'credit' | 'cash';
  color: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  frequency: string;
  autoPay: boolean;
  status: 'PAID' | 'UPCOMING';
}

interface FinanceContextType {
  transactions: TransactionItem[];
  unreviewedItems: UnreviewedItem[];
  accounts: BankAccount[];
  budgets: CategoryBudget[];
  recurrings: RecurringBill[];
  totalSpent: number; // Sum of confirmed expenses
  budgetLimit: number;
  netWorth: number;
  unreviewedCount: number;
  addTransaction: (tx: {
    description: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
    categoryId: string;
    accountId: string;
    notes?: string;
    date?: string;
  }) => void;
  confirmUnreviewedSingle: (id: string) => void;
  confirmAllUnreviewed: () => void;
  addAccount: (acc: { name: string; balance: number; type: 'checking' | 'credit' | 'cash' }) => void;
  addRecurring: (rec: Omit<RecurringBill, 'id'>) => void;
  resetToDefaults: () => void;
}

const INITIAL_UNREVIEWED: UnreviewedItem[] = [
  {
    id: 'unrev-1',
    description: 'Apple Music',
    amountInCents: 1099,
    category: 'SUBSCRIPTIONS',
    categoryBadgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    dateLabel: 'HOY',
    sourceNotes: 'Inyectado por n8n desde correo bancario'
  },
  {
    id: 'unrev-2',
    description: 'Supermercado Riba Smith',
    amountInCents: 3286,
    category: 'GROCERIES',
    categoryBadgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    dateLabel: 'HOY',
    sourceNotes: 'Notificación de compra con tarjeta débito'
  },
  {
    id: 'unrev-3',
    description: 'Uber Panamá',
    amountInCents: 2135,
    category: 'TRANSPORTATION',
    categoryBadgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    dateLabel: 'HOY',
    sourceNotes: 'Ingresado pasivamente por webhook'
  },
  {
    id: 'unrev-4',
    description: 'Film Noir Cinemas',
    amountInCents: 1799,
    category: 'ENTERTAINMENT',
    categoryBadgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    dateLabel: 'AYER'
  },
  {
    id: 'unrev-5',
    description: "Eden's Salads",
    amountInCents: 1512,
    category: 'RESTAURANTS',
    categoryBadgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    dateLabel: 'AYER'
  }
];

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx-1',
    title: 'Depósito de Nómina / Salario',
    category: 'SALARY',
    type: 'INCOME',
    amount: 2500.00,
    date: '2026-09-01',
    account: 'acc-debit-1',
    status: 'confirmed',
    categoryBadgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  {
    id: 'tx-2',
    title: 'Supermercado Riba Smith Bella Vista',
    category: 'GROCERIES',
    type: 'EXPENSE',
    amount: 145.50,
    date: '2026-09-03',
    account: 'acc-debit-1',
    status: 'confirmed',
    categoryBadgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  {
    id: 'tx-3',
    title: 'Alquiler Residencia San Francisco',
    category: 'HOUSING',
    type: 'EXPENSE',
    amount: 320.00,
    date: '2026-09-05',
    account: 'acc-debit-1',
    status: 'confirmed',
    categoryBadgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20'
  },
  {
    id: 'tx-4',
    title: 'Cena Restaurante Maito',
    category: 'RESTAURANTS',
    type: 'EXPENSE',
    amount: 84.50,
    date: '2026-09-08',
    account: 'acc-credit-1',
    status: 'confirmed',
    categoryBadgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/20'
  },
  {
    id: 'tx-5',
    title: 'Gasolina Estación Terpel',
    category: 'TRANSPORTATION',
    type: 'EXPENSE',
    amount: 45.00,
    date: '2026-09-10',
    account: 'acc-debit-1',
    status: 'confirmed',
    categoryBadgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
  },
  {
    id: 'tx-6',
    title: 'Suscripción Spotify Family',
    category: 'SUBSCRIPTIONS',
    type: 'EXPENSE',
    amount: 14.99,
    date: '2026-09-12',
    account: 'acc-credit-1',
    status: 'confirmed',
    categoryBadgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
  }
];

const INITIAL_ACCOUNTS: BankAccount[] = [
  { id: 'acc-debit-1', name: 'Banco General Débito', balance: 1420.50, type: 'checking', color: 'text-blue-400' },
  { id: 'acc-credit-1', name: 'BAC Visa Crédito', balance: 680.00, type: 'credit', color: 'text-amber-400' },
  { id: 'acc-cash-1', name: 'Efectivo Panamá', balance: 150.00, type: 'cash', color: 'text-emerald-400' }
];

const INITIAL_BUDGETS: CategoryBudget[] = [
  { id: 'b-1', category: 'Alimentación y Supermercado', spent: 178.36, limit: 500.00, color: '#10B981' },
  { id: 'b-2', category: 'Restaurantes y Deliveries', spent: 114.74, limit: 200.00, color: '#F59E0B' },
  { id: 'b-3', category: 'Entretenimiento y Streaming', spent: 62.98, limit: 150.00, color: '#8B5CF6' },
  { id: 'b-4', category: 'Transporte y Gasolina', spent: 86.35, limit: 120.00, color: '#06B6D4' }
];

const INITIAL_RECURRINGS: RecurringBill[] = [
  { id: 'rec-1', name: 'Alquiler Residencia', category: 'Vivienda', amount: 320.00, dueDate: 'Día 1 de cada mes', frequency: 'Mensual', autoPay: true, status: 'PAID' },
  { id: 'rec-2', name: 'Netflix 4K Ultra HD', category: 'Entretenimiento', amount: 19.99, dueDate: 'Día 15 de cada mes', frequency: 'Mensual', autoPay: true, status: 'UPCOMING' },
  { id: 'rec-3', name: 'Spotify Premium Family', category: 'Streaming', amount: 14.99, dueDate: 'Día 18 de cada mes', frequency: 'Mensual', autoPay: true, status: 'UPCOMING' },
  { id: 'rec-4', name: 'OpenAI ChatGPT Plus', category: 'Productividad', amount: 20.00, dueDate: 'Día 22 de cada mes', frequency: 'Mensual', autoPay: false, status: 'UPCOMING' },
  { id: 'rec-5', name: 'Servicios de Agua y Luz', category: 'Servicios Básicos', amount: 75.00, dueDate: 'Día 28 de cada mes', frequency: 'Mensual', autoPay: false, status: 'UPCOMING' }
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreviewedItems, setUnreviewedItems] = useState<UnreviewedItem[]>(() => {
    const saved = localStorage.getItem('lumina_unreviewed');
    return saved ? JSON.parse(saved) : INITIAL_UNREVIEWED;
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem('lumina_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('lumina_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('lumina_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [recurrings, setRecurrings] = useState<RecurringBill[]>(() => {
    const saved = localStorage.getItem('lumina_recurrings');
    return saved ? JSON.parse(saved) : INITIAL_RECURRINGS;
  });

  // Save changes to localStorage for persistent live testing
  useEffect(() => {
    localStorage.setItem('lumina_unreviewed', JSON.stringify(unreviewedItems));
  }, [unreviewedItems]);

  useEffect(() => {
    localStorage.setItem('lumina_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('lumina_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('lumina_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('lumina_recurrings', JSON.stringify(recurrings));
  }, [recurrings]);

  // Derived financial metrics
  const totalSpent = transactions
    .filter((t) => t.type === 'EXPENSE' && t.status === 'confirmed')
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetLimit = 2000.00;

  const totalLiquid = accounts
    .filter((a) => a.type !== 'credit')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalCredit = accounts
    .filter((a) => a.type === 'credit')
    .reduce((sum, a) => sum + a.balance, 0);

  const netWorth = totalLiquid - totalCredit;

  const addTransaction = ({
    description,
    amount,
    type,
    categoryId,
    accountId,
    notes,
    date
  }: {
    description: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
    categoryId: string;
    accountId: string;
    notes?: string;
    date?: string;
  }) => {
    const newId = `tx-user-${Date.now()}`;
    const txDate = date || new Date().toISOString().split('T')[0];

    const categoryColorMap: Record<string, string> = {
      'cat-groc': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      'cat-rest': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
      'cat-trans': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      'cat-sub': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      'cat-serv': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      'cat-salary': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
    };

    const newTx: TransactionItem = {
      id: newId,
      title: description,
      category: categoryId.replace('cat-', '').toUpperCase(),
      type,
      amount,
      date: txDate,
      account: accountId,
      status: 'confirmed',
      sourceNotes: notes || 'Transacción ingresada manualmente',
      categoryBadgeColor: categoryColorMap[categoryId] || 'bg-purple-500/10 text-purple-300 border-purple-500/20'
    };

    // Update transactions list
    setTransactions((prev) => [newTx, ...prev]);

    // Update corresponding account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const delta = type === 'INCOME' ? amount : -amount;
          return { ...acc, balance: Math.max(0, acc.balance + delta) };
        }
        return acc;
      })
    );

    // Update corresponding category budget spent if expense
    if (type === 'EXPENSE') {
      setBudgets((prev) =>
        prev.map((b) => {
          const catName = categoryId.toLowerCase();
          if (
            (catName.includes('groc') || catName.includes('super')) && b.category.includes('Alimentación') ||
            (catName.includes('rest')) && b.category.includes('Restaurantes') ||
            (catName.includes('sub')) && b.category.includes('Entretenimiento') ||
            (catName.includes('trans')) && b.category.includes('Transporte')
          ) {
            return { ...b, spent: b.spent + amount };
          }
          return b;
        })
      );
    }
  };

  const confirmUnreviewedSingle = (id: string) => {
    const target = unreviewedItems.find((item) => item.id === id);
    if (!target) return;

    const amountInDollars = target.amountInCents / 100;
    const newTx: TransactionItem = {
      id: `tx-approved-${Date.now()}-${id}`,
      title: target.description,
      category: target.category,
      type: 'EXPENSE',
      amount: amountInDollars,
      date: new Date().toISOString().split('T')[0],
      account: 'acc-debit-1',
      status: 'confirmed',
      sourceNotes: target.sourceNotes || 'Aprobado desde Bandeja de Entrada',
      categoryBadgeColor: target.categoryBadgeColor
    };

    setUnreviewedItems((prev) => prev.filter((i) => i.id !== id));
    setTransactions((prev) => [newTx, ...prev]);

    // Update account & budgets
    setAccounts((prev) =>
      prev.map((a) => (a.id === 'acc-debit-1' ? { ...a, balance: Math.max(0, a.balance - amountInDollars) } : a))
    );

    setBudgets((prev) =>
      prev.map((b) => {
        if (
          (target.category === 'GROCERIES' && b.category.includes('Alimentación')) ||
          (target.category === 'RESTAURANTS' && b.category.includes('Restaurantes')) ||
          (target.category === 'ENTERTAINMENT' && b.category.includes('Entretenimiento')) ||
          (target.category === 'TRANSPORTATION' && b.category.includes('Transporte'))
        ) {
          return { ...b, spent: b.spent + amountInDollars };
        }
        return b;
      })
    );
  };

  const confirmAllUnreviewed = () => {
    unreviewedItems.forEach((item) => {
      confirmUnreviewedSingle(item.id);
    });
  };

  const addAccount = (newAcc: { name: string; balance: number; type: 'checking' | 'credit' | 'cash' }) => {
    const accountItem: BankAccount = {
      id: `acc-custom-${Date.now()}`,
      name: newAcc.name,
      balance: newAcc.balance,
      type: newAcc.type,
      color: newAcc.type === 'credit' ? 'text-amber-400' : 'text-emerald-400'
    };
    setAccounts((prev) => [...prev, accountItem]);
  };

  const addRecurring = (newRec: Omit<RecurringBill, 'id'>) => {
    const item: RecurringBill = {
      ...newRec,
      id: `rec-${Date.now()}`
    };
    setRecurrings((prev) => [...prev, item]);
  };

  const resetToDefaults = () => {
    setUnreviewedItems(INITIAL_UNREVIEWED);
    setTransactions(INITIAL_TRANSACTIONS);
    setAccounts(INITIAL_ACCOUNTS);
    setBudgets(INITIAL_BUDGETS);
    setRecurrings(INITIAL_RECURRINGS);
    localStorage.removeItem('lumina_unreviewed');
    localStorage.removeItem('lumina_transactions');
    localStorage.removeItem('lumina_accounts');
    localStorage.removeItem('lumina_budgets');
    localStorage.removeItem('lumina_recurrings');
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        unreviewedItems,
        accounts,
        budgets,
        recurrings,
        totalSpent,
        budgetLimit,
        netWorth,
        unreviewedCount: unreviewedItems.length,
        addTransaction,
        confirmUnreviewedSingle,
        confirmAllUnreviewed,
        addAccount,
        addRecurring,
        resetToDefaults
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
