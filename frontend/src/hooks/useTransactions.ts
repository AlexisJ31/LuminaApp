import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amountInCents: number;
  type: 'INCOME' | 'EXPENSE';
  status: 'UNREVIEWED' | 'REVIEWED' | 'REJECTED';
  source: 'MANUAL' | 'WEBHOOK_N8N' | 'IMPORT';
  description: string;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewVariables {
  id: string;
  status: 'REVIEWED' | 'REJECTED';
}

interface MutationContext {
  previousTransactions?: Transaction[];
}

const API_BASE = 'http://localhost:4000/api/v1';

async function fetchTransactions(statusFilter?: string): Promise<Transaction[]> {
  const url = statusFilter 
    ? `${API_BASE}/transactions?status=${statusFilter}` 
    : `${API_BASE}/transactions`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Error al obtener transacciones');
  }
  const json = await res.json();
  return json.data || [];
}

async function reviewTransactionApi(id: string, newStatus: 'REVIEWED' | 'REJECTED'): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions/${id}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  if (!res.ok) {
    throw new Error('Error al revisar transacción');
  }
  const json = await res.json();
  return json.data;
}

export function useTransactions(statusFilter?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Transaction[]>({
    queryKey: ['transactions', statusFilter],
    queryFn: () => fetchTransactions(statusFilter),
    staleTime: 1000 * 30,
  });

  const reviewMutation = useMutation<Transaction, Error, ReviewVariables, MutationContext>({
    mutationFn: ({ id, status }: ReviewVariables) => reviewTransactionApi(id, status),

    onMutate: async ({ id, status }: ReviewVariables) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions', statusFilter]);

      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(['transactions', statusFilter], (old: Transaction[] | undefined) => {
          if (!old) return [];
          return old.map((t: Transaction) => (t.id === id ? { ...t, status } : t));
        });
      }

      return { previousTransactions };
    },

    onError: (_err: Error, _variables: ReviewVariables, context: MutationContext | undefined) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions', statusFilter], context.previousTransactions);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    reviewTransaction: reviewMutation.mutate,
    isReviewing: reviewMutation.isPending
  };
}
