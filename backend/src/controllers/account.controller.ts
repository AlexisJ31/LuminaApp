import { Request, Response } from 'express';

export interface BankAccountRecord {
  id: string;
  userId: string;
  name: string;
  type: 'DEBIT' | 'CREDIT' | 'CASH' | 'SAVINGS' | 'INVESTMENT';
  balanceInCents: number; // El Dogma de la Moneda (enteros en centavos)
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cuentas en memoria con persistencia de respaldo
const mockAccounts: BankAccountRecord[] = [
  {
    id: 'acc-debit-1',
    userId: 'usr-1',
    name: 'Banco General Débito (•••• 4821)',
    type: 'DEBIT',
    balanceInCents: 452050, // $4,520.50
    color: '#10B981',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-credit-1',
    userId: 'usr-1',
    name: 'Visa BAC Credomatic (•••• 9012)',
    type: 'CREDIT',
    balanceInCents: 125000, // $1,250.00
    color: '#F59E0B',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc-cash-1',
    userId: 'usr-1',
    name: 'Efectivo Panamá USD',
    type: 'CASH',
    balanceInCents: 18000, // $180.00
    color: '#06B6D4',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function listAccounts(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId || 'usr-1';
    const accounts = mockAccounts.filter(a => a.userId === userId);
    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createAccount(req: Request, res: Response): Promise<void> {
  try {
    const { name, type, balanceInCents, color } = req.body;
    const userId = (req as any).userId || req.body.userId || 'usr-1';

    const newAcc: BankAccountRecord = {
      id: `acc-usr-${Date.now()}`,
      userId,
      name: name.trim(),
      type: type || 'DEBIT',
      balanceInCents: balanceInCents || 0,
      color: color || '#10B981',
      isDefault: mockAccounts.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockAccounts.push(newAcc);

    res.status(201).json({
      success: true,
      message: 'Cuenta bancaria creada exitosamente',
      data: newAcc
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const idx = mockAccounts.findIndex(a => a.id === id);

    if (idx === -1) {
      res.status(404).json({ success: false, error: 'Cuenta bancaria no encontrada' });
      return;
    }

    const deleted = mockAccounts.splice(idx, 1)[0];
    res.status(200).json({
      success: true,
      message: `Cuenta bancaria ${deleted.name} eliminada`,
      data: deleted
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
