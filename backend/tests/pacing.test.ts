import { calculatePacingEngine } from '../src/services/pacing.service';

describe('Pacing Engine Service - Dogma de la Moneda', () => {
  it('debe calcular correctamente el ritmo UNDER cuando el gasto acumulado es menor al ritmo proporcional', () => {
    const budgetedInCents = 200000; // $2,000.00
    const spentInCents = 50000;     // $500.00
    const currentDay = 15;
    const daysInMonth = 30;

    const result = calculatePacingEngine(spentInCents, budgetedInCents, currentDay, daysInMonth);

    // Al dia 15 de 30, el ritmo esperado es el 50% ($1,000.00 = 100,000 centavos)
    expect(result.expectedSpentToDate).toBe(100000);
    expect(result.pacingStatus).toBe('UNDER');
    expect(result.pacingDiffInCents).toBe(50000); // 100,000 - 50,000 = 50,000 centavos de holgura
    expect(result.pacingRiskLevel).toBe('OPTIMAL');
  });

  it('debe advertir estado OVER y nivel CRITICAL cuando el ritmo proyecta superar el presupuesto', () => {
    const budgetedInCents = 100000; // $1,000.00
    const spentInCents = 90000;     // $900.00 gastados en apenas 10 dias
    const currentDay = 10;
    const daysInMonth = 30;

    const result = calculatePacingEngine(spentInCents, budgetedInCents, currentDay, daysInMonth);

    // Al dia 10 de 30, se proyecta un gasto total de 2,700.00
    expect(result.pacingStatus).toBe('OVER');
    expect(result.pacingRiskLevel).toBe('CRITICAL');
    expect(result.projectedMonthEndSpentInCents).toBe(270000);
  });

  it('debe calcular la velocidad de gasto diario para los dias restantes', () => {
    const budgetedInCents = 150000; // $1,500.00
    const spentInCents = 30000;     // $300.00
    const currentDay = 10;
    const daysInMonth = 30; // 20 dias restantes

    const result = calculatePacingEngine(spentInCents, budgetedInCents, currentDay, daysInMonth);

    // Presupuesto restante: 120,000 centavos / 20 dias = 6,000 centavos ($60.00) por dia
    expect(result.dailyBudgetVelocityInCents).toBe(6000);
  });
});
