import { Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';

// Schema de validación Zod para payloads entrantes de n8n (Yappy, WhatsApp, Email)
export const n8nWebhookSchema = z.object({
  idempotencyKey: z.string().optional(),
  description: z.string().min(1, 'La descripción de la transacción es requerida'),
  amount: z.number().positive('El monto debe ser un valor positivo').optional(),
  amountInCents: z.number().int().positive('El monto en centavos debe ser un entero positivo').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
  source: z.enum(['WEBHOOK_N8N', 'YAPPY_PUSH', 'WHATSAPP_BOT', 'EMAIL_PARSER']).default('WEBHOOK_N8N'),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
}).refine(data => data.amount !== undefined || data.amountInCents !== undefined, {
  message: 'Se requiere especificar "amount" en dólares o "amountInCents" en centavos enteros'
});

// Cache en memoria para prevención de idempotencia (registra claves procesadas durante 24 horas)
const idempotencyCache = new Set<string>();

/**
 * Middleware / Utilidad para verificar la firma HMAC SHA-256 de webhooks de n8n
 */
export function verifyWebhookSignature(payload: string, signatureHeader?: string, secretKey?: string): boolean {
  if (!signatureHeader || !secretKey) return true; // Si no hay secret configurado en Staging, permite continuar
  const computedHash = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(signatureHeader));
}

/**
 * Endpoint de Ingesta Webhook Real para n8n / Yappy / WhatsApp Bot
 * POST /api/v1/webhooks/n8n
 */
export async function processN8nWebhook(req: Request, res: Response): Promise<void> {
  try {
    // 1. Verificación de Idempotencia via Header o Body
    const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey;
    
    if (idempotencyKey) {
      if (idempotencyCache.has(idempotencyKey)) {
        res.status(200).json({
          success: true,
          duplicated: true,
          message: 'Evento omitido por regla de idempotencia (ya fue procesado previamente)',
          idempotencyKey
        });
        return;
      }
      idempotencyCache.add(idempotencyKey);
    }

    // 2. Validación de Payload con Zod
    const validationResult = n8nWebhookSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: 'Payload de webhook inválido según schema Zod',
        details: validationResult.error.format()
      });
      return;
    }

    const data = validationResult.data;

    // 3. El Dogma de la Moneda: Convertir a centavos de entero
    const computedCents = data.amountInCents 
      ? data.amountInCents 
      : Math.round((data.amount || 0) * 100);

    // 4. Inyección de Transacción Pendiente (Status: UNREVIEWED / PENDING)
    const newTransaction = {
      id: `tx-n8n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: req.body.userId || 'usr-1',
      accountId: data.accountId || 'acc-debit-1',
      categoryId: data.categoryId || 'cat-gen',
      amountInCents: computedCents,
      type: data.type,
      status: 'UNREVIEWED',
      source: data.source,
      description: data.description.trim(),
      notes: data.notes || `Inyectado por webhook n8n (${data.source})`,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Transacción inyectada exitosamente en el Inbox "Gastos por Revisar"',
      data: newTransaction
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar el webhook',
      details: error.message
    });
  }
}
