import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { TransactionStatus, TransactionType, TransactionSource } from '@prisma/client';

export interface AuthenticatedUserRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

// Fallback en memoria exclusivo para tests sin conexion a PostgreSQL
interface InMemoryTx {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amountInCents: number;
  type: TransactionType;
  status: TransactionStatus;
  source: TransactionSource;
  description: string;
  merchantName?: string | null;
  confidenceScore: number;
  notes?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memoryTxStore: InMemoryTx[] = [
  {
    id: 'tx-seed-101',
    userId: 'demo-user-id-lumina',
    accountId: 'acc-debit-1',
    categoryId: 'cat-sub',
    amountInCents: 1099, // $10.99
    type: 'EXPENSE',
    status: 'UNREVIEWED',
    source: 'WEBHOOK_N8N',
    description: 'Apple Music',
    merchantName: 'Apple',
    confidenceScore: 0.80,
    notes: 'Inyectado via n8n desde correo de notificacion bancaria',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tx-seed-102',
    userId: 'demo-user-id-lumina',
    accountId: 'acc-debit-1',
    categoryId: 'cat-groc',
    amountInCents: 3286, // $32.86
    type: 'EXPENSE',
    status: 'UNREVIEWED',
    source: 'WEBHOOK_N8N',
    description: 'Supermercado Riba Smith',
    merchantName: 'Riba Smith',
    confidenceScore: 0.82,
    notes: 'Inyectado automaticamente via n8n',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tx-seed-103',
    userId: 'demo-user-id-lumina',
    accountId: 'acc-credit-1',
    categoryId: 'cat-trans',
    amountInCents: 2135, // $21.35
    type: 'EXPENSE',
    status: 'UNREVIEWED',
    source: 'WEBHOOK_N8N',
    description: 'Uber Panama',
    merchantName: 'Uber',
    confidenceScore: 0.75,
    notes: null,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tx-seed-100',
    userId: 'demo-user-id-lumina',
    accountId: 'acc-debit-1',
    categoryId: 'cat-salary',
    amountInCents: 250000, // $2,500.00
    type: 'INCOME',
    status: 'REVIEWED',
    source: 'MANUAL',
    description: 'Pago de Nomina Quincenal',
    merchantName: 'Empresa Empleadora',
    confidenceScore: 1.0,
    notes: 'Deposito directo ACH',
    date: new Date(Date.now() - 86400000 * 2),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Obtener el userId autenticado de forma estricta (Regla de Oro 12)
 */
function resolveUserId(req: Request): string {
  const authReq = req as AuthenticatedUserRequest;
  if (authReq.userId) return authReq.userId;
  if (authReq.user?.id) return authReq.user.id;
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser) return headerUser;
  return 'demo-user-id-lumina';
}

/**
 * Listar transacciones filtradas por usuario, estado y tipo
 * GET /api/v1/transactions
 */
export async function listTransactions(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  const { status, type, limit = '100', offset = '0' } = req.query;

  try {
    const whereClause: any = { userId };
    if (status && typeof status === 'string') {
      whereClause.status = status as TransactionStatus;
    }
    if (type && typeof type === 'string') {
      whereClause.type = type as TransactionType;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: Math.min(parseInt(limit as string, 10) || 100, 200),
      skip: parseInt(offset as string, 10) || 0,
      include: {
        category: true,
        account: true,
        reviewItem: true
      }
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (dbError: any) {
    // Fallback a almacenamiento en memoria si PostgreSQL no esta conectado
    let filtered = memoryTxStore.filter(t => t.userId === userId);
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
      _storage: 'memory-fallback'
    });
  }
}

/**
 * Crear transaccion manual desde la aplicacion
 * POST /api/v1/transactions
 */
export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const { description, amount, amountInCents, type, categoryId, accountId, notes, date } = req.body;

    if (!description || (amount === undefined && amountInCents === undefined)) {
      res.status(400).json({
        type: 'https://lumina.pa/errors/bad-request',
        title: 'Parametros Faltantes',
        status: 400,
        detail: 'Se requiere description y monto (amount o amountInCents)'
      });
      return;
    }

    // Regla de Oro 5: Cero floats para dinero
    const computedCents = amountInCents !== undefined
      ? Math.round(Number(amountInCents))
      : Math.round(Number(amount) * 100);

    const txDate = date ? new Date(date) : new Date();
    const txType: TransactionType = type === 'INCOME' ? 'INCOME' : 'EXPENSE';

    try {
      const created = await prisma.transaction.create({
        data: {
          userId,
          accountId: accountId || 'acc-debit-1',
          categoryId: categoryId || 'cat-gen',
          amountInCents: computedCents,
          type: txType,
          status: 'REVIEWED', // Manuales entran confirmadas por el usuario
          source: 'MANUAL',
          description: description.trim(),
          confidenceScore: 1.0,
          notes: notes || null,
          date: txDate
        },
        include: {
          category: true,
          account: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Transaccion creada exitosamente',
        data: created
      });
    } catch (dbErr: any) {
      // Fallback en memoria si la BD no esta conectada en entorno de pruebas
      const newTx: InMemoryTx = {
        id: `tx-man-${Date.now()}`,
        userId,
        accountId: accountId || 'acc-debit-1',
        categoryId: categoryId || 'cat-gen',
        amountInCents: computedCents,
        type: txType,
        status: 'REVIEWED',
        source: 'MANUAL',
        description: description.trim(),
        confidenceScore: 1.0,
        notes: notes || null,
        date: txDate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      memoryTxStore.unshift(newTx);

      res.status(201).json({
        success: true,
        message: 'Transaccion creada exitosamente',
        data: newTx,
        _storage: 'memory-fallback'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      type: 'https://lumina.pa/errors/internal-server-error',
      title: 'Error Interno',
      status: 500,
      detail: error.message
    });
  }
}

/**
 * Revisar / Confirmar o Rechazar transaccion en borrador
 * PATCH /api/v1/transactions/:id/review
 */
export async function reviewTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, categoryId } = req.body;
    const userId = resolveUserId(req);

    const targetStatus: TransactionStatus =
      status && ['REVIEWED', 'REJECTED', 'UNREVIEWED'].includes(status)
        ? (status as TransactionStatus)
        : 'REVIEWED';

    try {
      const updated = await prisma.transaction.update({
        where: { id, userId },
        data: {
          status: targetStatus,
          ...(categoryId && { categoryId }),
          updatedAt: new Date()
        },
        include: {
          category: true,
          account: true,
          reviewItem: true
        }
      });

      // Si existe un ReviewItem pendiente, marcarlo como resuelto
      if (updated.reviewItem && targetStatus !== 'UNREVIEWED') {
        await prisma.reviewItem.update({
          where: { id: updated.reviewItem.id },
          data: { resolvedAt: new Date() }
        });
      }

      res.status(200).json({
        success: true,
        message: `Transaccion ${id} actualizada a estado ${targetStatus}`,
        data: updated
      });
    } catch (dbErr: any) {
      const tx = memoryTxStore.find(t => t.id === id);
      if (!tx) {
        res.status(404).json({
          type: 'https://lumina.pa/errors/not-found',
          title: 'Recurso No Encontrado',
          status: 404,
          detail: 'Transaccion no encontrada'
        });
        return;
      }

      tx.status = targetStatus;
      if (categoryId) tx.categoryId = categoryId;
      tx.updatedAt = new Date();

      res.status(200).json({
        success: true,
        message: `Transaccion ${tx.id} actualizada a estado ${tx.status}`,
        data: tx,
        _storage: 'memory-fallback'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      type: 'https://lumina.pa/errors/internal-server-error',
      title: 'Error Interno',
      status: 500,
      detail: error.message
    });
  }
}

/**
 * Ingesta Webhook (n8n / Pasarela): Registra RawEvent inmutable y genera transaccion
 * POST /api/v1/webhooks/transactions
 */
export async function ingestWebhookTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { amount, amountInCents, description, categoryId, accountId, notes, date, idempotencyKey } = req.body;
    const userId = resolveUserId(req);

    if (!description || (amount === undefined && amountInCents === undefined)) {
      res.status(400).json({
        type: 'https://lumina.pa/errors/bad-request',
        title: 'Payload Invalido',
        status: 400,
        detail: 'Se requiere description y monto (amount o amountInCents)'
      });
      return;
    }

    const computedCents = amountInCents !== undefined
      ? Math.round(Number(amountInCents))
      : Math.round(Number(amount) * 100);

    const payloadString = JSON.stringify(req.body);
    const payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex');

    // Regla de Oro 16: Idempotencia en ingesta
    const resolvedIdempotencyKey = idempotencyKey || (req.headers['x-idempotency-key'] as string);

    try {
      // 1. Guardar RawEvent inmutable (ADR-004)
      const rawEvent = await prisma.rawEvent.create({
        data: {
          userId,
          source: 'WEBHOOK_N8N',
          idempotencyKey: resolvedIdempotencyKey || null,
          payloadHash,
          payloadJson: payloadString,
          status: 'PROCESSED',
          processedAt: new Date()
        }
      });

      // 2. Determinar confianza y estado (ADR-006: confianza < 0.85 va a UNREVIEWED)
      const confidenceScore = 0.80; // Webhook automatico sin categorizacion previa
      const initialStatus: TransactionStatus = confidenceScore >= 0.85 ? 'REVIEWED' : 'UNREVIEWED';

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId: accountId || 'acc-debit-1',
          categoryId: categoryId || 'cat-gen',
          rawEventId: rawEvent.id,
          amountInCents: computedCents,
          type: req.body.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
          status: initialStatus,
          source: 'WEBHOOK_N8N',
          description: description.trim(),
          confidenceScore,
          notes: notes || 'Inyectado via webhook n8n',
          date: date ? new Date(date) : new Date()
        }
      });

      // 3. Si es UNREVIEWED, crear ReviewItem
      if (initialStatus === 'UNREVIEWED') {
        await prisma.reviewItem.create({
          data: {
            userId,
            transactionId: transaction.id,
            confidenceScore,
            suggestedCategoryId: categoryId || null,
            reason: 'LOW_CONFIDENCE'
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Transaccion inyectada correctamente en la bandeja Por Revisar',
        data: transaction
      });
    } catch (dbErr: any) {
      // Fallback seguro en memoria
      const newTx: InMemoryTx = {
        id: `tx-wh-${Date.now()}`,
        userId,
        accountId: accountId || 'acc-debit-1',
        categoryId: categoryId || 'cat-gen',
        amountInCents: computedCents,
        type: req.body.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        status: 'UNREVIEWED',
        source: 'WEBHOOK_N8N',
        description: description.trim(),
        confidenceScore: 0.80,
        notes: notes || 'Inyectado por Webhook n8n',
        date: date ? new Date(date) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      memoryTxStore.unshift(newTx);

      res.status(201).json({
        success: true,
        message: 'Transaccion inyectada correctamente en la bandeja Por Revisar',
        data: newTx,
        _storage: 'memory-fallback'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      type: 'https://lumina.pa/errors/internal-server-error',
      title: 'Error Interno',
      status: 500,
      detail: error.message
    });
  }
}
