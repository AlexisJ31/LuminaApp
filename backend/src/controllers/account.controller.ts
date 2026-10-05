import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AccountType } from '@prisma/client';

export interface AuthenticatedUserRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

interface InMemoryAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balanceInCents: number;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const memoryAccountStore: InMemoryAccount[] = [
  {
    id: 'acc-debit-1',
    userId: 'demo-user-id-lumina',
    name: 'Banco General Debito (•••• 4821)',
    type: 'DEBIT',
    balanceInCents: 452050, // $4,520.50
    color: '#10B981',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'acc-credit-1',
    userId: 'demo-user-id-lumina',
    name: 'Visa BAC Credomatic (•••• 9012)',
    type: 'CREDIT',
    balanceInCents: 125000, // $1,250.00
    color: '#F59E0B',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'acc-cash-1',
    userId: 'demo-user-id-lumina',
    name: 'Efectivo Panama USD',
    type: 'CASH',
    balanceInCents: 18000, // $180.00
    color: '#06B6D4',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function resolveUserId(req: Request): string {
  const authReq = req as AuthenticatedUserRequest;
  if (authReq.userId) return authReq.userId;
  if (authReq.user?.id) return authReq.user.id;
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser) return headerUser;
  return 'demo-user-id-lumina';
}

export async function listAccounts(req: Request, res: Response): Promise<void> {
  const userId = resolveUserId(req);
  try {
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error: any) {
    const userAccounts = memoryAccountStore.filter(a => a.userId === userId);
    res.status(200).json({
      success: true,
      count: userAccounts.length,
      data: userAccounts,
      _storage: 'memory-fallback'
    });
  }
}

export async function createAccount(req: Request, res: Response): Promise<void> {
  try {
    const userId = resolveUserId(req);
    const { name, type, balanceInCents, color } = req.body;

    if (!name) {
      res.status(400).json({
        type: 'https://lumina.pa/errors/bad-request',
        title: 'Parametro Requerido Faltante',
        status: 400,
        detail: 'El nombre de la cuenta bancaria es obligatorio'
      });
      return;
    }

    const accountType: AccountType = type || 'DEBIT';
    const computedBalance = balanceInCents ? Math.round(Number(balanceInCents)) : 0;

    try {
      const created = await prisma.account.create({
        data: {
          userId,
          name: name.trim(),
          type: accountType,
          balanceInCents: computedBalance,
          color: color || '#10B981',
          isDefault: false
        }
      });

      res.status(201).json({
        success: true,
        message: 'Cuenta bancaria creada exitosamente',
        data: created
      });
    } catch (dbErr: any) {
      const newAcc: InMemoryAccount = {
        id: `acc-usr-${Date.now()}`,
        userId,
        name: name.trim(),
        type: accountType,
        balanceInCents: computedBalance,
        color: color || '#10B981',
        isDefault: memoryAccountStore.length === 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      memoryAccountStore.push(newAcc);

      res.status(201).json({
        success: true,
        message: 'Cuenta bancaria creada exitosamente',
        data: newAcc,
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

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = resolveUserId(req);

    try {
      const deleted = await prisma.account.delete({
        where: { id, userId }
      });

      res.status(200).json({
        success: true,
        message: `Cuenta bancaria ${deleted.name} eliminada`,
        data: deleted
      });
    } catch (dbErr: any) {
      const idx = memoryAccountStore.findIndex(a => a.id === id && a.userId === userId);
      if (idx === -1) {
        res.status(404).json({
          type: 'https://lumina.pa/errors/not-found',
          title: 'Recurso No Encontrado',
          status: 404,
          detail: 'Cuenta bancaria no encontrada'
        });
        return;
      }

      const deleted = memoryAccountStore.splice(idx, 1)[0];
      res.status(200).json({
        success: true,
        message: `Cuenta bancaria ${deleted.name} eliminada`,
        data: deleted,
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
