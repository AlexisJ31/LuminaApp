import { Router } from 'express';
import { 
  ingestWebhookTransaction, 
  listTransactions, 
  createTransaction, 
  reviewTransaction 
} from '../controllers/transaction.controller';
import { validateWebhookApiKey } from '../middlewares/webhook.middleware';
import { getPacingSummary } from '../services/pacing.service';

const router = Router();

// Endpoint de Ingesta Webhook (Protegido por x-api-key)
router.post('/webhooks/transactions', validateWebhookApiKey, ingestWebhookTransaction);

// Endpoints CRUD de Transacciones
router.get('/transactions', listTransactions);
router.post('/transactions', createTransaction);
router.patch('/transactions/:id/review', reviewTransaction);

// Endpoint Pacing Engine (Calculado en Servidor)
router.get('/analytics/pacing', getPacingSummary);

export default router;
