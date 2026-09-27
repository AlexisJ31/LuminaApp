import { processN8nWebhook, verifyWebhookSignature } from '../src/controllers/webhook.controller';
import { Request, Response } from 'express';

describe('Fase 4: Ingesta Automática n8n / Webhook Yappy Real & Idempotencia', () => {

  function createMockResponse() {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  }

  describe('1. Validación de Payload Zod & El Dogma de la Moneda', () => {
    it('Debe rechazar webhooks sin monto (amount ni amountInCents) con HTTP 400 Bad Request', async () => {
      const req: Partial<Request> = {
        headers: {},
        body: {
          description: 'Uber Eats Panamá sin monto'
        }
      };
      const res = createMockResponse();

      await processN8nWebhook(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('Payload de webhook inválido')
      }));
    });

    it('Debe procesar e inyectar transacción en centavos enteros (El Dogma de la Moneda)', async () => {
      const req: Partial<Request> = {
        headers: { 'x-idempotency-key': `unique-test-key-${Date.now()}-1` },
        body: {
          description: 'Yappy Pago Supermercado Riba Smith',
          amount: 25.50,
          source: 'YAPPY_PUSH',
          notes: 'Pago recibido vía Yappy Comercial'
        }
      };
      const res = createMockResponse();

      await processN8nWebhook(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          description: 'Yappy Pago Supermercado Riba Smith',
          amountInCents: 2550, // $25.50 -> 2550 centavos
          status: 'UNREVIEWED',
          source: 'YAPPY_PUSH'
        })
      }));
    });
  });

  describe('2. Prevención de Idempotencia (Duplicados)', () => {
    it('Debe ignorar eventos duplicados con la misma clave de idempotencia enviando HTTP 200 OK', async () => {
      const idempotencyKey = `dup-key-${Date.now()}`;
      const req: Partial<Request> = {
        headers: { 'x-idempotency-key': idempotencyKey },
        body: {
          description: 'Notificación de Correo Banco General',
          amount: 14.99
        }
      };
      
      const res1 = createMockResponse();
      await processN8nWebhook(req as Request, res1);
      expect(res1.status).toHaveBeenCalledWith(201);

      // Segundo envío con la misma clave
      const res2 = createMockResponse();
      await processN8nWebhook(req as Request, res2);
      expect(res2.status).toHaveBeenCalledWith(200);
      expect(res2.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        duplicated: true,
        message: expect.stringContaining('regla de idempotencia')
      }));
    });
  });

  describe('3. Verificación de Firma HMAC SHA-256', () => {
    it('Debe validar correctamente firmas HMAC generadas legítimamente', () => {
      const secret = 'super-secret-key-panama';
      const payload = JSON.stringify({ amount: 100, description: 'Test' });
      const crypto = require('crypto');
      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const isValid = verifyWebhookSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });
  });

});
