import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Cache en memoria para llaves de idempotencia de webhooks (previene duplicados)
const processedIdempotencyKeys = new Set<string>();

/**
 * Middleware para validar el encabezado de autenticación API Key (x-api-key o Authorization Bearer).
 */
export function validateWebhookApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
  const expectedSecret = process.env.WEBHOOK_SECRET || process.env.N8N_WEBHOOK_KEY || 'lumina_secret_webhook_key_2026';

  let providedKey = '';

  if (typeof apiKeyHeader === 'string') {
    providedKey = apiKeyHeader.startsWith('Bearer ') 
      ? apiKeyHeader.substring(7).trim() 
      : apiKeyHeader.trim();
  }

  if (!providedKey || providedKey !== expectedSecret) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Acceso denegado. Encabezado x-api-key o Bearer token ausente o inválido.'
    });
    return;
  }

  next();
}

/**
 * Middleware para validar la firma HMAC SHA-256 en webhooks (x-lumina-signature).
 */
export function verifyWebhookSignature(req: Request, res: Response, next: NextFunction): void {
  const signature = req.headers['x-lumina-signature'] as string;
  const secret = process.env.WEBHOOK_HMAC_SECRET || process.env.WEBHOOK_SECRET || 'lumina_hmac_secret_key_2026';

  if (!signature) {
    // Si no se proporciona firma HMAC, continuar si x-api-key fue validado (retrocompatibilidad)
    return next();
  }

  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== computedSignature) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Firma de webhook HMAC no coincide (X-Lumina-Signature inválida).'
      });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error verificando firma HMAC: ' + error.message });
  }
}

/**
 * Middleware de Idempotencia para Webhooks (x-idempotency-key).
 * Previene el procesamiento duplicado de una misma transacción inyectada por n8n o reintentos de red.
 */
export function verifyWebhookIdempotency(req: Request, res: Response, next: NextFunction): void {
  const idempotencyKey = (req.headers['x-idempotency-key'] as string) || 
    `auto-${req.body.description}-${req.body.amountInCents || req.body.amount}-${req.body.date || ''}`;

  if (idempotencyKey && processedIdempotencyKeys.has(idempotencyKey)) {
    res.status(200).json({
      success: true,
      idempotent: true,
      message: 'Evento de webhook duplicado detectado e ignorado (Idempotencia activa).'
    });
    return;
  }

  if (idempotencyKey) {
    processedIdempotencyKeys.add(idempotencyKey);
    // Limpiar caché antigua para evitar fugas de memoria (máx 10,000 llaves)
    if (processedIdempotencyKeys.size > 10000) {
      const firstItem = processedIdempotencyKeys.values().next().value;
      if (firstItem) processedIdempotencyKeys.delete(firstItem);
    }
  }

  next();
}
