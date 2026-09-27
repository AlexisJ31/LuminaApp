import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Esquema Zod de validación para ingesta y creación de transacciones.
 * Garantiza "El Dogma de la Moneda" (montos positivos, validación de tipos).
 */
export const createTransactionSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.number().positive('El monto debe ser un número positivo').optional(),
  amountInCents: z.number().int().positive('El monto en centavos debe ser entero positivo').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional().default('EXPENSE'),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  userId: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional()
}).refine(data => data.amount !== undefined || data.amountInCents !== undefined, {
  message: 'Debe proporcionar al menos "amount" (USD decimal) o "amountInCents" (entero centavos)'
});

/**
 * Esquema Zod para revisión / aprobación de transacciones en el Inbox.
 */
export const reviewTransactionSchema = z.object({
  status: z.enum(['UNREVIEWED', 'REVIEWED', 'REJECTED']).optional(),
  categoryId: z.string().optional()
});

/**
 * Esquema Zod para creación de Cuentas Bancarias.
 */
export const createAccountSchema = z.object({
  name: z.string().min(1, 'El nombre de la cuenta es requerido'),
  type: z.enum(['DEBIT', 'CREDIT', 'CASH', 'SAVINGS', 'INVESTMENT']).default('DEBIT'),
  balanceInCents: z.number().int().min(0, 'El saldo en centavos no puede ser negativo').optional().default(0),
  color: z.string().optional().default('#10B981')
});

/**
 * Middleware genérico para aplicar esquemas de validación Zod.
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Bad Request: Error de validación en los datos de entrada (Zod)',
          issues: error.issues.map((err: any) => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      res.status(400).json({ success: false, error: 'Payload de solicitud inválido' });
    }
  };
}
