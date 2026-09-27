import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getUserProfile, deleteUserAccount } from '../controllers/user.controller';

const router = Router();

// Todas las rutas requieren token de sesión activo
router.use(authMiddleware);

// Endpoint de verificación de perfil del usuario
router.get('/me', getUserProfile);

// Endpoint de cumplimiento Ley 81 de Panamá (Derecho al olvido)
router.delete('/account', deleteUserAccount);

export default router;
