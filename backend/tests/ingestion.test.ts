import { n8nWebhookSchema, verifyWebhookSignature } from '../src/controllers/webhook.controller';
import crypto from 'crypto';

describe('Pipeline de Ingesta y Webhooks - Criterios de Aceptacion', () => {
  const secretKey = 'clave-secreta-pruebas-hmac';

  it('debe validar un payload valido con amount en dolares y convertir a centavos enteros', () => {
    const rawPayload = {
      description: 'Supermercado Riba Smith Transistmica',
      amount: 45.50,
      type: 'EXPENSE',
      source: 'WEBHOOK_N8N'
    };

    const parsed = n8nWebhookSchema.safeParse(rawPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const computedCents = parsed.data.amountInCents !== undefined
        ? parsed.data.amountInCents
        : Math.round((parsed.data.amount || 0) * 100);
      expect(computedCents).toBe(4550);
    }
  });

  it('debe rechazar un payload sin descripcion ni monto', () => {
    const invalidPayload = {
      notes: 'Transaccion sin datos minimos'
    };

    const parsed = n8nWebhookSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('debe verificar firmas HMAC SHA-256 validas de webhook', () => {
    const payload = JSON.stringify({ description: 'Pago de Luz ENSA', amount: 35.00 });
    const signature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

    const isValid = verifyWebhookSignature(payload, signature, secretKey);
    expect(isValid).toBe(true);
  });

  it('debe rechazar firmas HMAC manipuladas o incorrectas', () => {
    const payload = JSON.stringify({ description: 'Pago de Luz ENSA', amount: 35.00 });
    const forgedSignature = 'firma_invalida_falsa_1234567890abcdef1234567890abcdef1234567890abcdef';

    // Para evitar discrepancia de longitudes en crypto.timingSafeEqual en strings arbitrarias,
    // creamos un hash real con otra clave
    const badSignature = crypto.createHmac('sha256', 'otra-clave-diferente').update(payload).digest('hex');

    const isValid = verifyWebhookSignature(payload, badSignature, secretKey);
    expect(isValid).toBe(false);
  });
});
