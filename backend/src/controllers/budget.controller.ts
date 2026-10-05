import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { BudgetPeriod } from '@prisma/client';

export interface AuthenticatedUserRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

interface InMemoryBudget {
  id: string;
  userId: string;
  categoryId: string;
  limitInCents: number;
  period: BudgetPeriod;
  createdAt: Date;
  updatedAt: Date;
}

const memoryBudgetStore: InMemoryBudget[] = [
  { id: 'bgt-1', userId: 'demo-user-id-lumina', categoryId: 'cat-groc', limitInCents: 45000, period: 'MONTHLY', createdAt: new Date(), updatedAt: new Date() },
  { id: 'bgt-2', userId: 'demo-user-id-lumina', categoryId: 'cat-rest', limitInCents: 20000, period: 'MONTHLY', createdAt: new Date(), updatedAt: new Date() },
  { id: 'bgt-3', userId: 'demo-user-id-lumina', categoryId: 'cat-trans', limitInCents: 15000, period: 'MONTHLY', createdAt: new Date(), updatedAt: new Date() },
  { id: 'bgt-4', userId: 'demo-user-id-lumina', categoryId: 'cat-sub', limitInCents: 10000, period: 'MONTHLY', createdAt: new Date(), updatedAt: new Date() }
];

function resolveUserId(req: Request): string {
  const authReq = req as AuthenticatedUserRequest;
  if (authReq.userId) return authReq.userId;
  if (authReq.user?.id) return authReq.user.id;
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser) return headerUser;
  return 'demo-user-id-lumina';
}

export async function listBudgets(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true }
    });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error: any) {
    const userBudgets = memoryBudgetStore.filter(b => b.userId === userId);
    res.status(200).json({
      success: true,
      count: userBudgets.length,
      data: userBudgets,
      _storage: 'memory-fallback'
    });
  }
}

export async function updateBudgetLimit(req: Request, res: Response): Promise<void> {
  try {
    const { categoryId } = req.params;
    const { limitInCents, limit, period = 'MONTHLY' } = req.body;
    const userId = resolveUserId(req);

    const computedLimitCents = limitInCents !== undefined
      ? Math.round(Number(limitInCents))
      : Math.round(Number(limit) * 100);

    const targetPeriod = (period as BudgetPeriod) || 'MONTHLY';

    try {
      const budget = await prisma.budget.upsert({
        where: {
          userId_categoryId_period: {
            userId,
            categoryId,
            period: targetPeriod
          }
        },
        update: {
          limitInCents: computedLimitCents,
          updatedAt: new Date()
        },
        create: {
          userId,
          categoryId,
          limitInCents: computedLimitCents,
          period: targetPeriod
        },
        include: {
          category: true
        }
      });

      res.status(200).json({
        success: true,
        message: 'Presupuesto de categoria actualizado',
        data: budget
      });
    } catch (dbErr: any) {
      let target = memoryBudgetStore.find(b => b.userId === userId && b.categoryId === categoryId);

      if (target) {
        target.limitInCents = computedLimitCents;
        target.updatedAt = new Date();
      } else {
        target = {
          id: `bgt-${Date.now()}`,
          userId,
          categoryId,
          limitInCents: computedLimitCents,
          period: targetPeriod,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        memoryBudgetStore.push(target);
      }

      res.status(200).json({
        success: true,
        message: 'Presupuesto de categoria actualizado',
        data: target,
        _storage: 'memory-fallback'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      type: 'https://lumina.pa/errors/internal-server-error',
      title: 'Error Interno',
      status: 500,
      detail: error.message
    });
  }
}
