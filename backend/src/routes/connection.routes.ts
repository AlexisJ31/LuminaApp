import { Router } from 'express';
import { 
  listConnections, 
  createConnection, 
  deleteConnection 
} from '../controllers/connection.controller';

const router = Router();

// Rutas para gestion de conexiones de fuentes externas
router.get('/', listConnections);
router.post('/', createConnection);
router.delete('/:id', deleteConnection);

export default router;
