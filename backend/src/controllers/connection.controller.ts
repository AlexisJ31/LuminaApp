import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { AuthenticatedUserRequest } from './transaction.controller';
import { ConnectionType } from '@prisma/client';

function resolveUserId(req: Request): string {
  const authReq = req as AuthenticatedUserRequest;
  if (authReq.userId) return authReq.userId;
  if (authReq.user?.id) return authReq.user.id;
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser) return headerUser;
  return 'demo-user-id-lumina';
}

/**
 * Listar conexiones activas de integracion para el usuario
 * GET /api/v1/connections
 */
export async function listConnections(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);

  try {
    const connections = await prisma.sourceConnection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections
    });
  } catch (error: any) {
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      _storage: 'memory-fallback'
    });
  }
}

/**
 * Crear una nueva conexion de integracion (ej. n8n, Yappy, notificaciones bancarias)
 * POST /api/v1/connections
 */
export async function createConnection(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  const { name, type = 'WEBHOOK' } = req.body;

  if (!name) {
    res.status(400).json({
      type: 'https://lumina.pa/errors/bad-request',
      title: 'Parametros Faltantes',
      status: 400,
      detail: 'El nombre de la conexion es obligatorio'
    });
    return;
  }

  // Generar clave API segura para la conexion
  const rawApiKey = `lum_live_${crypto.randomBytes(24).toString('hex')}`;
  const apiKeyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

  const connType = (type as ConnectionType) || 'WEBHOOK';

  try {
    const connection = await prisma.sourceConnection.create({
      data: {
        userId,
        name: name.trim(),
        type: connType,
        apiKeyHash,
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Conexion creada exitosamente. Guarde su API Key; no sera mostrada de nuevo.',
      data: {
        id: connection.id,
        name: connection.name,
        type: connection.type,
        status: connection.status,
        apiKey: rawApiKey, // Solo se entrega en la respuesta de creacion
        webhookUrl: `https://luminaapp.netlify.app/api/v1/webhooks/transactions`,
        createdAt: connection.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({
      type: 'https://lumina.pa/errors/internal-server-error',
      title: 'Error Interno',
      status: 500,
      detail: error.message
    });
  }
}

/**
 * Revocar / Eliminar una conexion de integracion
 * DELETE /api/v1/connections/:id
 */
export async function deleteConnection(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  const { id } = req.params;

  try {
    const conn = await prisma.sourceConnection.findFirst({
      where: { id, userId }
    });

    if (!conn) {
      res.status(404).json({
        type: 'https://lumina.pa/errors/not-found',
        title: 'Recurso No Encontrado',
        status: 404,
        detail: 'Conexion no encontrada'
      });
      return;
    }

    await prisma.sourceConnection.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: `Conexion ${conn.name} revocada exitosamente`
    });
  } catch (error: any) {
    res.status(500).json({
      type: 'https://lumina.pa/errors/internal-server-error',
      title: 'Error Interno',
      status: 500,
      detail: error.message
    });
  }
}
