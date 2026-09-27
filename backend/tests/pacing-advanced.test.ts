import { calculatePacingEngine } from '../src/services/pacing.service';

describe('Fase 5: Motor de Pacing Avanzado (Proyección al Cierre de Mes & Alertas IA)', () => {

  it('Debe calcular correctamente el Pacing óptimo cuando el gasto está por debajo del ritmo', () => {
    // Escenario: Día 15 de 30. Presupuesto $2,000 (200000 centavos). Gasto real $800 (80000 centavos).
    // Esperado al día 15: (200000 / 30) * 15 = 100000 centavos ($1,000).
    const result = calculatePacingEngine(80000, 200000, 15, 30);

    expect(result.pacingStatus).toBe('UNDER');
    expect(result.pacingDiffInCents).toBe(20000); // $200 de margen a favor
    expect(result.projectedMonthEndSpentInCents).toBe(160000); // Proyección a fin de mes: $1,600
    expect(result.pacingRiskLevel).toBe('OPTIMAL');
    expect(result.dailyBudgetVelocityInCents).toBe(8000); // $80.00/día restante
  });

  it('Debe detectar nivel de riesgo CRITICAL y proyectar sobregasto al cierre de mes', () => {
    // Escenario: Día 10 de 30. Presupuesto $1,000 (100000 centavos). Gasto acelerado $600 (60000 centavos).
    // Proyección a fin de mes: (60000 / 10) * 30 = 180000 centavos ($1,800).
    const result = calculatePacingEngine(60000, 100000, 10, 30);

    expect(result.pacingStatus).toBe('OVER');
    expect(result.projectedMonthEndSpentInCents).toBe(180000); // Sobregasto proyectado de $800
    expect(result.pacingRiskLevel).toBe('CRITICAL');
    expect(result.smartRecommendation).toContain('proyectas sobrepasar tu presupuesto por $800.00');
  });

  it('Debe mantener la precisión de enteros en centavos sin errores de punto flotante', () => {
    // Escenario con montos imprecisos en floats tradicionalmente
    const result = calculatePacingEngine(139001, 200000, 15, 30);

    expect(Number.isInteger(result.expectedSpentToDate)).toBe(true);
    expect(Number.isInteger(result.pacingDiffInCents)).toBe(true);
    expect(Number.isInteger(result.projectedMonthEndSpentInCents)).toBe(true);
    expect(Number.isInteger(result.dailyBudgetVelocityInCents)).toBe(true);
  });

});
