import { parseBankStatement } from '../src/services/statement-parser.service';

describe('Fase 5: Extractor de Estados de Cuenta de Bancos de Panama (ING-06)', () => {
  it('debe detectar y parsear extracto de Banco General con debitos y creditos en centavos', () => {
    const bgCsv = `
Banco General - Estado de Cuenta
FECHA,DESCRIPCION,REFERENCIA,DEBITO,CREDITO,SALDO
15/09/2026,COMPRA RIBA SMITH BELLA VISTA,REF-9812,45.50,,1200.50
16/09/2026,DEPOSITO ACH NOMINA EMPRESA,REF-9813,,1250.00,2450.50
17/09/2026,RECARGA METROBUS SONDA,REF-9814,10.00,,2440.50
    `.trim();

    const result = parseBankStatement(bgCsv);

    expect(result.detectedBank).toBe('BANCO_GENERAL');
    expect(result.totalParsed).toBe(3);
    expect(result.totalExpenseInCents).toBe(5550); // 45.50 + 10.00 = 55.50 = 5550 centavos
    expect(result.totalIncomeInCents).toBe(125000); // 1250.00 = 125000 centavos

    const tx1 = result.transactions[0];
    expect(tx1.rawDescription).toBe('COMPRA RIBA SMITH BELLA VISTA');
    expect(tx1.normalizedMerchant).toBe('Supermercado Riba Smith');
    expect(tx1.amountInCents).toBe(4550);
    expect(tx1.type).toBe('EXPENSE');
    expect(tx1.referenceNumber).toBe('REF-9812');

    const tx2 = result.transactions[1];
    expect(tx2.amountInCents).toBe(125000);
    expect(tx2.type).toBe('INCOME');
  });

  it('debe detectar y parsear extracto de BAC Credomatic', () => {
    const bacCsv = `
BAC CREDOMATIC ESTADO DE MOVIMIENTOS
Fecha Transaccion,Descripcion,Monto,Tipo
10/09/2026,UBER PANAMA TRIP,14.25,DEBITO
12/09/2026,PAGO DE TARJETA ACH,200.00,CREDITO
    `.trim();

    const result = parseBankStatement(bacCsv);

    expect(result.detectedBank).toBe('BAC_CREDOMATIC');
    expect(result.totalParsed).toBe(2);
    expect(result.transactions[0].amountInCents).toBe(1425);
    expect(result.transactions[0].type).toBe('EXPENSE');
    expect(result.transactions[0].normalizedMerchant).toBe('Uber Panama');

    expect(result.transactions[1].amountInCents).toBe(20000);
    expect(result.transactions[1].type).toBe('INCOME');
  });

  it('debe manejar entradas vacias o corruptas sin fallar', () => {
    const emptyResult = parseBankStatement('');
    expect(emptyResult.totalParsed).toBe(0);
    expect(emptyResult.errors.length).toBeGreaterThan(0);
  });
});
