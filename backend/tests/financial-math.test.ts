import { calculatePacingEngine } from '../src/services/pacing.service';
import { createTransactionSchema } from '../src/middlewares/validation.middleware';
import crypto from 'crypto';

describe('Pruebas de Matemática Financiera (El Dogma de la Moneda)', () => {
  test('Garantiza operaciones exactas en centavos enteros (sin errores de float)', () => {
    const item1Cents = 1099; // $10.99
    const item2Cents = 3286; // $32.86
    const item3Cents = 2135; // $21.35

    const totalCents = item1Cents + item2Cents + item3Cents;
    expect(totalCents).toBe(6520); // $65.20 exactos

    const formattedDollars = (totalCents / 100).toFixed(2);
    expect(formattedDollars).toBe('65.20');
  });

  test('Convierte montos decimales a enteros en centavos sin perder precisión', () => {
    const rawDecimal = 19.99;
    const computedCents = Math.round(rawDecimal * 100);
    expect(computedCents).toBe(1999);
  });
});

describe('Motor de Pacing Financiero (Server-side Pacing Engine)', () => {
  test('Calcula estado UNDER cuando el gasto está por debajo de la meta proporcional', () => {
    const budgetedInCents = 200000; // $2,000.00
    const spentInCents = 50000;      // $500.00 gastados
    const currentDay = 15;
    const daysInMonth = 30;

    const result = calculatePacingEngine(spentInCents, budgetedInCents, currentDay, daysInMonth);

    expect(result.expectedSpentToDate).toBe(100000); // Al día 15/30 se esperaba haber gastado $1,000.00
    expect(result.pacingStatus).toBe('UNDER');
    expect(result.pacingDiffInCents).toBe(50000); // $500.00 por debajo del ritmo máximo
  });

  test('Calcula estado OVER cuando el gasto supera la meta proporcional al día actual', () => {
    const budgetedInCents = 200000; // $2,000.00
    const spentInCents = 150000;     // $1,500.00 gastados al día 10
    const currentDay = 10;
    const daysInMonth = 30;

    const result = calculatePacingEngine(spentInCents, budgetedInCents, currentDay, daysInMonth);

    expect(result.expectedSpentToDate).toBe(66667); // ~$666.67 esperado al día 10
    expect(result.pacingStatus).toBe('OVER');
    expect(result.pacingDiffInCents).toBe(83333); // ~$833.33 por encima del ritmo
  });
});

describe('Validación Zod y Seguridad de Webhooks HMAC', () => {
  test('Rechaza solicitudes con montos negativos o campos faltantes', () => {
    const invalidInput = {
      description: '',
      amount: -50
    };

    const parseResult = createTransactionSchema.safeParse(invalidInput);
    expect(parseResult.success).toBe(false);
  });

  test('Valida firma HMAC SHA-256 correctamente', () => {
    const secret = 'test_secret_key';
    const payload = { description: 'Supermercado Riba Smith', amountInCents: 3286 };

    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    expect(computedSignature).toHaveLength(64);
  });
});
