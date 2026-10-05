import { Request, Response } from 'express';
import { parseBankStatement } from '../services/statement-parser.service';
import { processIngestPipeline } from '../services/ingestion.service';
import { AuthenticatedUserRequest } from './transaction.controller';

function resolveUserId(req: Request): string {
  const authReq = req as AuthenticatedUserRequest;
  if (authReq.userId) return authReq.userId;
  if (authReq.user?.id) return authReq.user.id;
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser) return headerUser;
  return 'demo-user-id-lumina';
}

/**
 * Previsualizar la extraccion de un extracto bancario antes de persistir
 * POST /api/v1/import/preview
 */
export async function previewStatement(req: Request, res: Response): Promise<void> {
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    res.status(400).json({
      type: 'https://lumina.pa/errors/bad-request',
      title: 'Contenido Requerido',
      status: 400,
      detail: 'Se requiere el contenido del extracto bancario en texto o formato CSV'
    });
    return;
  }

  const parsed = parseBankStatement(content);

  res.status(200).json({
    success: true,
    data: parsed
  });
}

/**
 * Confirmar e insertar las transacciones de un extracto bancario
 * POST /api/v1/import/confirm
 */
export async function confirmImport(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  const { accountId = 'acc-debit-1', transactions } = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    res.status(400).json({
      type: 'https://lumina.pa/errors/bad-request',
      title: 'Transacciones Requeridas',
      status: 400,
      detail: 'Se requiere una lista de transacciones para confirmar la importacion'
    });
    return;
  }

  const results = [];
  let confirmedCount = 0;
  let unreviewedCount = 0;
  let duplicateCount = 0;

  for (const item of transactions) {
    try {
      const idempotencyKey = `imp-${userId}-${item.rawDescription || item.description}-${item.amountInCents}-${item.date}`;
      const outcome = await processIngestPipeline({
        userId,
        source: 'IMPORT',
        idempotencyKey,
        description: item.rawDescription || item.description,
        amountInCents: item.amountInCents,
        type: item.type || 'EXPENSE',
        accountId,
        categoryId: item.suggestedCategoryId || item.categoryId,
        notes: item.referenceNumber ? `Ref: ${item.referenceNumber}` : 'Importado desde extracto bancario',
        date: item.date ? new Date(item.date) : new Date()
      });

      if (outcome.duplicated) {
        duplicateCount++;
      } else if (outcome.status === 'REVIEWED') {
        confirmedCount++;
      } else {
        unreviewedCount++;
      }

      results.push(outcome);
    } catch {
      // Continuar con la siguiente fila
    }
  }

  res.status(201).json({
    success: true,
    message: `Importacion completada: ${confirmedCount} confirmadas, ${unreviewedCount} por revisar, ${duplicateCount} duplicadas omitidas.`,
    summary: {
      totalProcessed: transactions.length,
      confirmedCount,
      unreviewedCount,
      duplicateCount
    },
    data: results
  });
}
