import { Request, Response } from 'express';

export interface PacingSummary {
  spentInCents: number;
  budgetedInCents: number;
  pacingStatus: 'UNDER' | 'OVER';
  pacingDiffInCents: number;
  daysInMonth: number;
  currentDay: number;
  monthLabel: string;
  netWorthInCents: number;
  netWorthGrowthPct: number;
}

/**
 * Endpoint GET /api/v1/analytics/pacing
 * Calcula en el SERVIDOR el estado del ritmo de gasto (Pacing Engine) y patrimonio neto.
 * Zero client-side computation.
 */
export async function getPacingSummary(req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    
    // Normalizar día actual y total de días en el mes (UTC-5 Panamá)
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Valores simulados/masticados (en centavos Int)
    const budgetedInCents = 200000; // $2,000.00
    const spentInCents = 65000;      // $650.00 gastados hasta el día de hoy

    // Fórmula del Pacing Engine:
    // Gasto esperado al día actual = (Presupuesto total / Días del mes) * Día actual
    const expectedSpentToDate = Math.round((budgetedInCents / daysInMonth) * currentDay);
    const pacingDiffInCents = expectedSpentToDate - spentInCents;

    const pacingStatus: 'UNDER' | 'OVER' = pacingDiffInCents >= 0 ? 'UNDER' : 'OVER';

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const summary: PacingSummary = {
      spentInCents,
      budgetedInCents,
      pacingStatus,
      pacingDiffInCents: Math.abs(pacingDiffInCents),
      daysInMonth,
      currentDay,
      monthLabel: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      netWorthInCents: 10000000, // $100,000.00
      netWorthGrowthPct: 32.5
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
