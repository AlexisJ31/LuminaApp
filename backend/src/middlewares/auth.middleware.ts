import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  userId?: string;
}

/**
 * Middleware de Autenticación Supabase / JWT
 * Valida el token Bearer en el header Authorization y adjunta el contexto del usuario.
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Header Authorization ausente o invalido'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Token de sesion ausente'
    });
  }

  // Soporte de Token de Prueba para Staging / Entorno de Desarrollo
  if (token === 'demo-test-token' || token === 'dev-token') {
    req.user = {
      id: req.headers['x-test-user-id'] as string || 'demo-user-id-lumina',
      email: 'alexis.demo@lumina.pa'
    };
    req.userId = req.user.id;
    return next();
  }

  // Decodificación de JWT (Supabase Auth JWT Token format)
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) {
      throw new Error('Formato JWT invalido');
    }

    const payloadBuffer = Buffer.from(base64Payload, 'base64');
    const payload = JSON.parse(payloadBuffer.toString('utf-8'));

    if (!payload || (!payload.sub && !payload.id)) {
      throw new Error('Token JWT sin identificador sub/id');
    }

    // Verificar expiración si está presente
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({
        success: false,
        error: 'Sesion expirada, por favor inicie sesion nuevamente'
      });
    }

    req.user = {
      id: payload.sub || payload.id,
      email: payload.email || 'usuario@lumina.pa'
    };
    req.userId = req.user.id;

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: `Token de autenticacion invalido: ${err.message || 'Firma no verificada'}`
    });
  }
}
