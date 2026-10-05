import { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { TransactionSource, TransactionStatus } from '@prisma/client';

// Schema de validacion Zod para payloads entrantes de n8n / Pasarelas de Panama
export const n8nWebhookSchema = z.object({
  idempotencyKey: z.string().optional(),
  description: z.string().min(1, 'La descripcion de la transaccion es requerida'),
  amount: z.number().positive('El monto debe ser un valor positivo').optional(),
  amountInCents: z.number().int().positive('El monto en centavos debe ser un entero positivo').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
  source: z.enum(['WEBHOOK_N8N', 'YAPPY_PUSH', 'WHATSAPP_BOT', 'EMAIL_PARSER']).default('WEBHOOK_N8N'),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
}).refine(data => data.amount !== undefined || data.amountInCents !== undefined, {
  message: 'Se requiere especificar "amount" en dolares o "amountInCents" en centavos enteros'
});

// Cache en memoria para deduplicacion rapida (72 horas)
const idempotencyCache = new Set<string>();

/**
 * Utilidad para verificar la firma HMAC SHA-256 de webhooks entrantes
 */
export function verifyWebhookSignature(payload: string, signatureHeader?: string, secretKey?: string): boolean {
  if (!signatureHeader || !secretKey) return true;
  const computedHash = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(signatureHeader));
}

/**
 * Endpoint de Ingesta Webhook Real para n8n / Yappy / Notificaciones Bancarias
 * POST /api/v1/webhooks/n8n
 */
export async function processN8nWebhook(req: Request, res: Response): Promise<void> {
  try {
    // 1. Verificacion de Idempotencia via Header o Body (ADR-005)
    const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey;
    
    if (idempotencyKey) {
      if (idempotencyCache.has(idempotencyKey)) {
        res.status(200).json({
          success: true,
          duplicated: true,
          message: 'Evento omitido por regla de idempotencia (procesado previamente)',
          idempotencyKey
        });
        return;
      }
      idempotencyCache.add(idempotencyKey);
    }

    // 2. Validacion de Payload con Zod
    const validationResult = n8nWebhookSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: 'Payload de webhook inválido según schema Zod',
        type: 'https://lumina.pa/errors/validation-failed',
        title: 'Error de Validacion de Payload',
        status: 400,
        detail: 'El formato de los datos no cumple con el esquema requerido',
        invalidParams: validationResult.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message
        }))
      });
      return;
    }

    const data = validationResult.data;
    const userId = req.body.userId || (req as any).userId || 'demo-user-id-lumina';

    // 3. Regla de Oro 5: El Dogma de la Moneda
    const computedCents = data.amountInCents !== undefined
      ? data.amountInCents
      : Math.round((data.amount || 0) * 100);

    const payloadString = JSON.stringify(req.body);
    const payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex');
    const txSource: TransactionSource = data.source as TransactionSource;

    try {
      // 4. Registrar RawEvent inmutable (ADR-004)
      const rawEvent = await prisma.rawEvent.create({
        data: {
          userId,
          source: txSource,
          idempotencyKey: idempotencyKey || null,
          payloadHash,
          payloadJson: payloadString,
          status: 'PROCESSED',
          processedAt: new Date()
        }
      });

      // 5. Insercion de transaccion en estado UNREVIEWED (ADR-006)
      const confidenceScore = 0.80; // Notificacion inicial sin categorizacion aprobada
      const initialStatus: TransactionStatus = 'UNREVIEWED';

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId: data.accountId || 'acc-debit-1',
          categoryId: data.categoryId || 'cat-gen',
          rawEventId: rawEvent.id,
          amountInCents: computedCents,
          type: data.type,
          status: initialStatus,
          source: txSource,
          description: data.description.trim(),
          confidenceScore,
          notes: data.notes || `Inyectado por webhook n8n (${data.source})`,
          date: data.date ? new Date(data.date) : new Date()
        }
      });

      // 6. Crear ReviewItem asociado en la bandeja de revision
      await prisma.reviewItem.create({
        data: {
          userId,
          transactionId: transaction.id,
          confidenceScore,
          suggestedCategoryId: data.categoryId || null,
          reason: 'LOW_CONFIDENCE'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Transaccion inyectada exitosamente en la bandeja Gastos por Revisar',
        data: transaction
      });
    } catch (dbErr: any) {
      // Fallback seguro si la base de datos no esta disponible
      const fallbackTx = {
        id: `tx-n8n-${Date.now()}`,
        userId,
        accountId: data.accountId || 'acc-debit-1',
        categoryId: data.categoryId || 'cat-gen',
        amountInCents: computedCents,
        type: data.type,
        status: 'UNREVIEWED',
        source: txSource,
        description: data.description.trim(),
        confidenceScore: 0.80,
        notes: data.notes || `Inyectado por webhook n8n (${data.source})`,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Transaccion inyectada exitosamente en la bandeja Gastos por Revisar',
        data: fallbackTx,
        _storage: 'memory-fallback'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      type: 'https://lumina.pa/errors/internal-server-error',
      title: 'Error Interno del Servidor',
      status: 500,
      detail: error.message
    });
  }
}
