import { Router } from 'express';
import { 
  ingestWebhookTransaction, 
  listTransactions, 
  createTransaction, 
  reviewTransaction 
} from '../controllers/transaction.controller';
import { 
  listAccounts, 
  createAccount, 
  deleteAccount 
} from '../controllers/account.controller';
import { listCategories } from '../controllers/category.controller';
import { listBudgets, updateBudgetLimit } from '../controllers/budget.controller';
import { 
  validateWebhookApiKey, 
  verifyWebhookSignature, 
  verifyWebhookIdempotency 
} from '../middlewares/webhook.middleware';
import { 
  validateBody, 
  createTransactionSchema, 
  reviewTransactionSchema, 
  createAccountSchema 
} from '../middlewares/validation.middleware';
import { getPacingSummary } from '../services/pacing.service';

const router = Router();

// Endpoint de Ingesta Webhook (Protegido por x-api-key, HMAC y Idempotencia)
router.post(
  '/webhooks/transactions',
  validateWebhookApiKey,
  verifyWebhookSignature,
  verifyWebhookIdempotency,
  validateBody(createTransactionSchema),
  ingestWebhookTransaction
);

// Endpoints CRUD de Transacciones
router.get('/transactions', listTransactions);
router.post('/transactions', validateBody(createTransactionSchema), createTransaction);
router.patch('/transactions/:id/review', validateBody(reviewTransactionSchema), reviewTransaction);

// Endpoints CRUD de Cuentas Bancarias
router.get('/accounts', listAccounts);
router.post('/accounts', validateBody(createAccountSchema), createAccount);
router.delete('/accounts/:id', deleteAccount);

// Endpoints CRUD de Categorías y Presupuestos
router.get('/categories', listCategories);
router.get('/budgets', listBudgets);
router.put('/budgets/:categoryId', updateBudgetLimit);

// Endpoint Pacing Engine (Calculado en Servidor)
router.get('/analytics/pacing', getPacingSummary);

export default router;
