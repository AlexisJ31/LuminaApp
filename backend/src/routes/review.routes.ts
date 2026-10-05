import { Router } from 'express';
import { 
  listReviewInbox, 
  confirmReviewItem, 
  rejectReviewItem, 
  confirmAllReviewItems 
} from '../controllers/review.controller';

const router = Router();

// Rutas de la bandeja de revision (Inbox)
router.get('/', listReviewInbox);
router.post('/confirm-all', confirmAllReviewItems);
router.post('/:id/confirm', confirmReviewItem);
router.post('/:id/reject', rejectReviewItem);

export default router;
