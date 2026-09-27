import { Request, Response } from 'express';

export interface BudgetRecord {
  id: string;
  userId: string;
  categoryId: string;
  limitInCents: number; // El Dogma de la Moneda
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  createdAt: string;
  updatedAt: string;
}

const mockBudgets: BudgetRecord[] = [
  { id: 'bgt-1', userId: 'usr-1', categoryId: 'cat-groc', limitInCents: 45000, period: 'MONTHLY', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bgt-2', userId: 'usr-1', categoryId: 'cat-rest', limitInCents: 20000, period: 'MONTHLY', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bgt-3', userId: 'usr-1', categoryId: 'cat-trans', limitInCents: 15000, period: 'MONTHLY', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bgt-4', userId: 'usr-1', categoryId: 'cat-sub', limitInCents: 10000, period: 'MONTHLY', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

export async function listBudgets(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId || 'usr-1';
    const userBudgets = mockBudgets.filter(b => b.userId === userId);
    res.status(200).json({
      success: true,
      count: userBudgets.length,
      data: userBudgets
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateBudgetLimit(req: Request, res: Response): Promise<void> {
  try {
    const { categoryId } = req.params;
    const { limitInCents, limit } = req.body;
    const userId = (req as any).userId || 'usr-1';

    const computedLimitCents = limitInCents !== undefined 
      ? Math.round(Number(limitInCents))
      : Math.round(Number(limit) * 100);

    let target = mockBudgets.find(b => b.userId === userId && b.categoryId === categoryId);

    if (target) {
      target.limitInCents = computedLimitCents;
      target.updatedAt = new Date().toISOString();
    } else {
      target = {
        id: `bgt-${Date.now()}`,
        userId,
        categoryId,
        limitInCents: computedLimitCents,
        period: 'MONTHLY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockBudgets.push(target);
    }

    res.status(200).json({
      success: true,
      message: 'Presupuesto de categoría actualizado',
      data: target
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
