import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para validar el encabezado de autenticación de Webhooks (n8n / Ingesta Externa).
 * Rechaza peticiones sin encabezado 'x-api-key' válido con un estado HTTP 401 Unauthorized.
 */
export function validateWebhookApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization'];
  
  // Clave secreta obtenida del entorno o fallback para desarrollo local
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

  // Petición autorizada, continuar al siguiente controlador
  next();
}
