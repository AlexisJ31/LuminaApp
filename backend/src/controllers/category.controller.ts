import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { TransactionType } from '@prisma/client';

export interface AuthenticatedUserRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

interface DefaultCategory {
  id: string;
  userId?: string | null;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

const defaultCategories: DefaultCategory[] = [
  { id: 'cat-groc', name: 'Alimentacion y Supermercado', icon: 'shopping-cart', color: '#10B981', type: 'EXPENSE' },
  { id: 'cat-rest', name: 'Restaurantes y Salidas', icon: 'utensils', color: '#F97316', type: 'EXPENSE' },
  { id: 'cat-trans', name: 'Transporte y Movilidad', icon: 'car', color: '#F59E0B', type: 'EXPENSE' },
  { id: 'cat-sub', name: 'Entretenimiento y Suscripciones', icon: 'tv', color: '#06B6D4', type: 'EXPENSE' },
  { id: 'cat-serv', name: 'Servicios Basicos y Alquiler', icon: 'home', color: '#3B82F6', type: 'EXPENSE' },
  { id: 'cat-salary', name: 'Salario y Nomina', icon: 'dollar-sign', color: '#10B981', type: 'INCOME' }
];

function resolveUserId(req: Request): string {
  const authReq = req as AuthenticatedUserRequest;
  if (authReq.userId) return authReq.userId;
  if (authReq.user?.id) return authReq.user.id;
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser) return headerUser;
  return 'demo-user-id-lumina';
}

export async function listCategories(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: null }, // Categorias globales
          { userId }        // Categorias personalizadas del usuario
        ]
      },
      orderBy: { name: 'asc' }
    });

    if (categories.length === 0) {
      res.status(200).json({
        success: true,
        count: defaultCategories.length,
        data: defaultCategories
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error: any) {
    res.status(200).json({
      success: true,
      count: defaultCategories.length,
      data: defaultCategories,
      _storage: 'memory-fallback'
    });
  }
}
