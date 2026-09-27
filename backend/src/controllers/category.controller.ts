import { Request, Response } from 'express';

export interface CategoryRecord {
  id: string;
  userId?: string;
  name: string;
  icon: string;
  color: string;
  type: 'EXPENSE' | 'INCOME';
}

const mockCategories: CategoryRecord[] = [
  { id: 'cat-groc', name: 'Alimentación y Supermercado', icon: 'shopping-cart', color: '#10B981', type: 'EXPENSE' },
  { id: 'cat-rest', name: 'Restaurantes y Salidas', icon: 'utensils', color: '#F97316', type: 'EXPENSE' },
  { id: 'cat-trans', name: 'Transporte y Movilidad', icon: 'car', color: '#F59E0B', type: 'EXPENSE' },
  { id: 'cat-sub', name: 'Entretenimiento y Suscripciones', icon: 'tv', color: '#06B6D4', type: 'EXPENSE' },
  { id: 'cat-serv', name: 'Servicios Básicos y Alquiler', icon: 'home', color: '#3B82F6', type: 'EXPENSE' },
  { id: 'cat-salary', name: 'Salario y Nómina', icon: 'dollar-sign', color: '#10B981', type: 'INCOME' }
];

export async function listCategories(req: Request, res: Response): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      count: mockCategories.length,
      data: mockCategories
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
