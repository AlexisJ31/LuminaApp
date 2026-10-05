import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedUserRequest } from './transaction.controller';

function resolveUserId(req: Request): string {
  const authReq = req as AuthenticatedUserRequest;
  if (authReq.userId) return authReq.userId;
  if (authReq.user?.id) return authReq.user.id;
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser) return headerUser;
  return 'demo-user-id-lumina';
}

/**
 * Listar transacciones pendientes de revision en el Inbox
 * GET /api/v1/review-inbox
 */
export async function listReviewInbox(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);

  try {
    const unreviewedTxs = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'UNREVIEWED'
      },
      include: {
        category: true,
        account: true,
        reviewItem: true
      },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: unreviewedTxs.length,
      data: unreviewedTxs
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
 * Confirmar una transaccion de la bandeja de revision
 * POST /api/v1/review-inbox/:id/confirm
 */
export async function confirmReviewItem(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  const { id } = req.params;
  const { categoryId, merchantName, notes } = req.body;

  try {
    const tx = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!tx) {
      res.status(404).json({
        type: 'https://lumina.pa/errors/not-found',
        title: 'Recurso No Encontrado',
        status: 404,
        detail: 'Transaccion no encontrada en la bandeja de revision'
      });
      return;
    }

    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'REVIEWED',
        ...(categoryId && { categoryId }),
        ...(merchantName && { merchantName: merchantName.trim() }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
      include: {
        category: true,
        account: true
      }
    });

    // Resolver el ReviewItem asociado
    await prisma.reviewItem.updateMany({
      where: { transactionId: id, userId },
      data: { resolvedAt: new Date() }
    });

    // Aprendizaje: Si el usuario ajusto la categoria y comercio, guardar alias
    if (merchantName && categoryId) {
      try {
        await prisma.merchantAlias.upsert({
          where: {
            userId_rawPattern: {
              userId,
              rawPattern: merchantName.toUpperCase().trim()
            }
          },
          update: {
            defaultCategoryId: categoryId,
            confidence: 1.0,
            updatedAt: new Date()
          },
          create: {
            userId,
            rawPattern: merchantName.toUpperCase().trim(),
            normalizedName: merchantName.trim(),
            defaultCategoryId: categoryId,
            confidence: 1.0
          }
        });
      } catch {
        // Ignorar fallo no critico al guardar alias
      }
    }

    res.status(200).json({
      success: true,
      message: 'Transaccion confirmada exitosamente',
      data: updatedTx
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
 * Rechazar o descartar una transaccion de la bandeja de revision
 * POST /api/v1/review-inbox/:id/reject
 */
export async function rejectReviewItem(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  const { id } = req.params;

  try {
    const tx = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!tx) {
      res.status(404).json({
        type: 'https://lumina.pa/errors/not-found',
        title: 'Recurso No Encontrado',
        status: 404,
        detail: 'Transaccion no encontrada en la bandeja de revision'
      });
      return;
    }

    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'REJECTED',
        updatedAt: new Date()
      }
    });

    await prisma.reviewItem.updateMany({
      where: { transactionId: id, userId },
      data: { resolvedAt: new Date() }
    });

    res.status(200).json({
      success: true,
      message: 'Transaccion rechazada y descartada',
      data: updatedTx
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
 * Confirmar todas las transacciones pendientes en lote
 * POST /api/v1/review-inbox/confirm-all
 */
export async function confirmAllReviewItems(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);

  try {
    const updateResult = await prisma.transaction.updateMany({
      where: {
        userId,
        status: 'UNREVIEWED'
      },
      data: {
        status: 'REVIEWED',
        updatedAt: new Date()
      }
    });

    await prisma.reviewItem.updateMany({
      where: {
        userId,
        resolvedAt: null
      },
      data: {
        resolvedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: `Se confirmaron exitosamente ${updateResult.count} transacciones`,
      count: updateResult.count
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
