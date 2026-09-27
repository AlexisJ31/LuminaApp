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

  // Fase 5: Cálculos Avanzados de Pacing & Inteligencia Financiera
  projectedMonthEndSpentInCents: number;
  dailyBudgetVelocityInCents: number;
  pacingRiskLevel: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  smartRecommendation: string;
}

/**
 * Función pura para calcular Pacing Engine Avanzado de acuerdo al "Dogma de la Moneda".
 */
export function calculatePacingEngine(
  spentInCents: number,
  budgetedInCents: number,
  currentDay: number,
  daysInMonth: number
) {
  const safeCurrentDay = Math.max(1, currentDay);
  const remainingDays = Math.max(1, daysInMonth - safeCurrentDay);

  // 1. Ritmo esperado proporcional al día del mes
  const expectedSpentToDate = Math.round((budgetedInCents / daysInMonth) * safeCurrentDay);
  const rawDiff = expectedSpentToDate - spentInCents;
  const pacingStatus: 'UNDER' | 'OVER' = rawDiff >= 0 ? 'UNDER' : 'OVER';

  // 2. Proyección de gasto al día 30 (Run-Rate Trend)
  const projectedMonthEndSpentInCents = Math.round((spentInCents / safeCurrentDay) * daysInMonth);

  // 3. Velocidad de gasto diario permitida para los días restantes
  const remainingBudgetInCents = Math.max(0, budgetedInCents - spentInCents);
  const dailyBudgetVelocityInCents = Math.round(remainingBudgetInCents / remainingDays);

  // 4. Determinación de Nivel de Riesgo e Inteligencia Financiera
  let pacingRiskLevel: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
  let smartRecommendation = 'Tu ritmo de gasto está perfectamente alineado con tu presupuesto mensual.';

  if (projectedMonthEndSpentInCents > budgetedInCents) {
    pacingRiskLevel = 'CRITICAL';
    const overspendForecast = Math.round((projectedMonthEndSpentInCents - budgetedInCents) / 100);
    smartRecommendation = `Al ritmo actual, proyectas sobrepasar tu presupuesto por $${overspendForecast}.00 al cierre de mes. Reduce tu gasto diario a $${(dailyBudgetVelocityInCents / 100).toFixed(2)}.`;
  } else if (pacingStatus === 'OVER') {
    pacingRiskLevel = 'WARNING';
    smartRecommendation = `Estás ligeramente por encima del ritmo diario. Mantén tu gasto diario por debajo de $${(dailyBudgetVelocityInCents / 100).toFixed(2)}.`;
  }

  return {
    expectedSpentToDate,
    pacingDiffInCents: Math.abs(rawDiff),
    pacingStatus,
    projectedMonthEndSpentInCents,
    dailyBudgetVelocityInCents,
    pacingRiskLevel,
    smartRecommendation
  };
}

/**
 * Endpoint GET /api/v1/analytics/pacing
 * Calcula en el SERVIDOR el estado del ritmo de gasto (Pacing Engine Avanzado).
 */
export async function getPacingSummary(req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const budgetedInCents = 200000;  // $2,000.00
    const spentInCents = 65000;       // $650.00
    const netWorthInCents = 10000000; // $100,000.00

    const calculations = calculatePacingEngine(
      spentInCents,
      budgetedInCents,
      currentDay,
      daysInMonth
    );

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const summary: PacingSummary = {
      spentInCents,
      budgetedInCents,
      pacingStatus: calculations.pacingStatus,
      pacingDiffInCents: calculations.pacingDiffInCents,
      daysInMonth,
      currentDay,
      monthLabel: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      netWorthInCents,
      netWorthGrowthPct: 32.5,
      projectedMonthEndSpentInCents: calculations.projectedMonthEndSpentInCents,
      dailyBudgetVelocityInCents: calculations.dailyBudgetVelocityInCents,
      pacingRiskLevel: calculations.pacingRiskLevel,
      smartRecommendation: calculations.smartRecommendation
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
