import { Request, Response } from 'express';

// Almacenamiento en memoria para modo simulación API (cuando Prisma DB no está conectada)
export interface TransactionRecord {
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
  date: string; // ISO string normalizada Panamá UTC-5
  createdAt: string;
  updatedAt: string;
}

// Semilla de base de datos simulada en memoria
const mockTransactions: TransactionRecord[] = [
  {
    id: 'tx-101',
    userId: 'usr-1',
    accountId: 'acc-debit-1',
    categoryId: 'cat-sub',
    amountInCents: 1099, // $10.99
    type: 'EXPENSE',
    status: 'UNREVIEWED',
    source: 'WEBHOOK_N8N',
    description: 'Apple Music',
    notes: 'Inyectado vía n8n desde correo de notificación bancaria',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-102',
    userId: 'usr-1',
    accountId: 'acc-debit-1',
    categoryId: 'cat-groc',
    amountInCents: 3286, // $32.86
    type: 'EXPENSE',
    status: 'UNREVIEWED',
    source: 'WEBHOOK_N8N',
    description: 'Supermercado Riba Smith',
    notes: 'Inyectado automáticamente vía n8n',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-103',
    userId: 'usr-1',
    accountId: 'acc-credit-1',
    categoryId: 'cat-trans',
    amountInCents: 2135, // $21.35
    type: 'EXPENSE',
    status: 'UNREVIEWED',
    source: 'WEBHOOK_N8N',
    description: 'Uber Panamá',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-100',
    userId: 'usr-1',
    accountId: 'acc-debit-1',
    categoryId: 'cat-salary',
    amountInCents: 250000, // $2,500.00
    type: 'INCOME',
    status: 'REVIEWED',
    source: 'MANUAL',
    description: 'Pago de Nómina Mensual',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Endpoint de Ingesta Webhook (n8n): Recibe transacciones crudas y las guarda como UNREVIEWED.
 * POST /api/v1/webhooks/transactions
 */
export async function ingestWebhookTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { amount, amountInCents, description, categoryId, accountId, notes } = req.body;

    if (!description || (!amount && !amountInCents)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Se requiere description y monto (amount o amountInCents)'
      });
      return;
    }

    // El Dogma de la Moneda: Convertir a centavos si viene en decimal
    const computedCents = amountInCents 
      ? Math.round(Number(amountInCents)) 
      : Math.round(Number(amount) * 100);

    const newTx: TransactionRecord = {
      id: `tx-wh-${Date.now()}`,
      userId: req.body.userId || 'usr-1',
      accountId: accountId || 'acc-debit-1',
      categoryId: categoryId || 'cat-gen',
      amountInCents: computedCents,
      type: req.body.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      status: 'UNREVIEWED',
      source: 'WEBHOOK_N8N',
      description: description.trim(),
      notes: notes || 'Inyectado por Webhook n8n',
      date: req.body.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockTransactions.unshift(newTx);

    res.status(201).json({
      success: true,
      message: 'Transacción inyectada correctamente en la bandeja Por Revisar',
      data: newTx
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Listar transacciones con filtros opcionales (status, type).
 * GET /api/v1/transactions
 */
export async function listTransactions(req: Request, res: Response): Promise<void> {
  try {
    const { status, type } = req.query;

    let filtered = [...mockTransactions];

    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Crear transacción manual desde la aplicación.
 * POST /api/v1/transactions
 */
export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { description, amount, amountInCents, type, categoryId, accountId, notes } = req.body;

    if (!description || (!amount && !amountInCents)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Se requiere description y monto'
      });
      return;
    }

    const computedCents = amountInCents 
      ? Math.round(Number(amountInCents)) 
      : Math.round(Number(amount) * 100);

    const newTx: TransactionRecord = {
      id: `tx-man-${Date.now()}`,
      userId: req.body.userId || 'usr-1',
      accountId: accountId || 'acc-debit-1',
      categoryId: categoryId || 'cat-gen',
      amountInCents: computedCents,
      type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      status: 'REVIEWED', // Manuales entran directamente como revisadas
      source: 'MANUAL',
      description: description.trim(),
      notes: notes || '',
      date: req.body.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockTransactions.unshift(newTx);

    res.status(201).json({
      success: true,
      message: 'Transacción creada exitosamente',
      data: newTx
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Revisar / Confirmar o Rechazar transacción en borrador.
 * PATCH /api/v1/transactions/:id/review
 */
export async function reviewTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, categoryId } = req.body;

    const tx = mockTransactions.find(t => t.id === id);

    if (!tx) {
      res.status(404).json({ success: false, error: 'Transacción no encontrada' });
      return;
    }

    if (status && ['REVIEWED', 'REJECTED', 'UNREVIEWED'].includes(status)) {
      tx.status = status;
    } else {
      tx.status = 'REVIEWED'; // Default action when reviewed
    }

    if (categoryId) {
      tx.categoryId = categoryId;
    }

    tx.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: `Transacción ${tx.id} actualizada a estado ${tx.status}`,
      data: tx
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
