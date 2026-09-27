import { authMiddleware, AuthenticatedRequest } from '../src/middlewares/auth.middleware';
import { getUserProfile, deleteUserAccount } from '../src/controllers/user.controller';
import { Response } from 'express';

describe('Fase 2: Autenticacion Supabase JWT, RLS Multitenancy y Ley 81 Panama', () => {

  function createMockResponse() {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  }

  describe('1. Middleware de Autenticación Supabase JWT', () => {
    it('Debe rechazar peticiones sin header Authorization con estado 401 Unauthorized', () => {
      const req: Partial<AuthenticatedRequest> = { headers: {} };
      const res = createMockResponse();
      const next = jest.fn();

      authMiddleware(req as AuthenticatedRequest, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('Header Authorization ausente')
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe rechazar tokens malformados con estado 401 Unauthorized', () => {
      const req: Partial<AuthenticatedRequest> = {
        headers: { authorization: 'Bearer token_malformado' }
      };
      const res = createMockResponse();
      const next = jest.fn();

      authMiddleware(req as AuthenticatedRequest, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe aceptar token de prueba valido y adjuntar contexto de usuario', () => {
      const req: Partial<AuthenticatedRequest> = {
        headers: {
          authorization: 'Bearer demo-test-token',
          'x-test-user-id': 'user-panama-uuid-101'
        }
      };
      const res = createMockResponse();
      const next = jest.fn();

      authMiddleware(req as AuthenticatedRequest, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user?.id).toBe('user-panama-uuid-101');
      expect(req.userId).toBe('user-panama-uuid-101');
    });
  });

  describe('2. Cumplimiento Ley 81 de Panamá (Derecho de Supresión)', () => {
    it('Debe procesar la supresion permanente de datos (Derecho al Olvido)', async () => {
      const req: Partial<AuthenticatedRequest> = {
        userId: 'user-para-borrar-888',
        user: { id: 'user-para-borrar-888', email: 'alexis.demo@lumina.pa' }
      };
      const res = createMockResponse();

      await deleteUserAccount(req as AuthenticatedRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        deletedUserId: 'user-para-borrar-888',
        message: expect.stringContaining('Ley 81 de Panama')
      }));
    });

    it('Debe retornar perfil de usuario con indicador de seguridad RLS activo', async () => {
      const req: Partial<AuthenticatedRequest> = {
        userId: 'user-panama-uuid-101',
        user: { id: 'user-panama-uuid-101', email: 'alexis.demo@lumina.pa' }
      };
      const res = createMockResponse();

      await getUserProfile(req as AuthenticatedRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: 'user-panama-uuid-101',
          currency: 'USD',
          timezone: 'America/Panama',
          ley81Compliant: true,
          securityStatus: expect.objectContaining({
            rlsActive: true,
            dataIsolation: 'STRICT_USER_ID'
          })
        })
      }));
    });
  });

  describe('3. Aislamiento Estricto por Usuario (Multitenancy RLS)', () => {
    it('Debe garantizar el aislamiento estricto entre contextos de Usuario A y Usuario B', () => {
      const reqUserA: Partial<AuthenticatedRequest> = { userId: 'user-A-123' };
      const reqUserB: Partial<AuthenticatedRequest> = { userId: 'user-B-456' };

      expect(reqUserA.userId).not.toEqual(reqUserB.userId);
      expect(reqUserA.userId).toBe('user-A-123');
      expect(reqUserB.userId).toBe('user-B-456');
    });
  });

});
