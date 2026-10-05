import { Router } from 'express';
import { previewStatement, confirmImport } from '../controllers/import.controller';

const router = Router();

// Rutas de importacion de extractos bancarios (Fase 5 / ING-06)
router.post('/preview', previewStatement);
router.post('/confirm', confirmImport);

export default router;
