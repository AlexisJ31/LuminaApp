import { Router } from 'express';
import { processN8nWebhook } from '../controllers/webhook.controller';

const router = Router();

/**
 * @route   POST /api/v1/webhooks/n8n
 * @desc    Endpoint público asegurado para ingesta automática de webhooks desde n8n / Yappy / WhatsApp
 * @access  Public (Protected via HMAC & X-API-Key)
 */
router.post('/n8n', processN8nWebhook);

export default router;
