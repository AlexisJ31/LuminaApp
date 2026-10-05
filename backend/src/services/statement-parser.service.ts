import { normalizeMerchant } from './normalizer.service';
import { TransactionType } from '@prisma/client';

export type SupportedBankFormat = 'BANCO_GENERAL' | 'BAC_CREDOMATIC' | 'BANISTMO' | 'GENERIC_CSV';

export interface ParsedStatementTransaction {
  date: Date;
  rawDescription: string;
  normalizedMerchant: string;
  suggestedCategoryId: string;
  confidenceScore: number;
  amountInCents: number;
  type: TransactionType;
  referenceNumber?: string;
  balanceAfterInCents?: number;
}

export interface StatementParseResult {
  detectedBank: SupportedBankFormat;
  totalParsed: number;
  totalIncomeInCents: number;
  totalExpenseInCents: number;
  transactions: ParsedStatementTransaction[];
  errors: string[];
}

/**
 * Parsea fechas en formatos comunes de extractos bancarios de Panama (DD/MM/YYYY, YYYY-MM-DD)
 */
function parseStatementDate(dateStr: string): Date {
  const trimmed = dateStr.trim();
  // Formato DD/MM/YYYY
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    return new Date(Date.UTC(year, month, day, 12, 0, 0));
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Convierte un string monetario con comas o simbolos a centavos de entero (ADR-001)
 */
function parseMoneyToCents(amountStr: string): number {
  if (!amountStr) return 0;
  // Eliminar signos de dolar, espacios y comas de miles
  const cleaned = amountStr.replace(/[$ ]/g, '').replace(/,/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : Math.round(Math.abs(val) * 100);
}

/**
 * Parser de extractos bancarios en CSV o formato delimitado para bancos de Panama
 */
export function parseBankStatement(csvContent: string): StatementParseResult {
  const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const result: StatementParseResult = {
    detectedBank: 'GENERIC_CSV',
    totalParsed: 0,
    totalIncomeInCents: 0,
    totalExpenseInCents: 0,
    transactions: [],
    errors: []
  };

  if (lines.length === 0) {
    result.errors.push('El archivo o contenido de extracto esta vacio');
    return result;
  }

  // 1. Deteccion de cabecera y banco emisor
  let headerIndex = -1;
  let detectedBank: SupportedBankFormat = 'GENERIC_CSV';

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const lineUpper = lines[i].toUpperCase();
    if (lineUpper.includes('BANCO GENERAL') || (lineUpper.includes('DEBITO') && lineUpper.includes('CREDITO') && lineUpper.includes('SALDO'))) {
      detectedBank = 'BANCO_GENERAL';
      headerIndex = i;
      break;
    }
    if (lineUpper.includes('BAC') || lineUpper.includes('CREDOMATIC') || lineUpper.includes('TRANSACCION')) {
      detectedBank = 'BAC_CREDOMATIC';
      headerIndex = i;
      break;
    }
    if (lineUpper.includes('BANISTMO') || lineUpper.includes('CONCEPTO')) {
      detectedBank = 'BANISTMO';
      headerIndex = i;
      break;
    }
    if (lineUpper.includes('FECHA') && lineUpper.includes('DESCRIPCION')) {
      detectedBank = 'GENERIC_CSV';
      headerIndex = i;
      break;
    }
  }

  result.detectedBank = detectedBank;
  const startRow = headerIndex >= 0 ? headerIndex + 1 : 0;

  // 2. Procesamiento de lineas de transacciones
  for (let i = startRow; i < lines.length; i++) {
    const rawLine = lines[i];
    // Soportar delimitadores por coma o punto y coma
    const delimiter = rawLine.includes(';') ? ';' : ',';
    const cols = rawLine.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());

    if (cols.length < 3) continue;

    try {
      let date: Date;
      let rawDescription: string;
      let amountInCents = 0;
      let type: TransactionType = 'EXPENSE';
      let referenceNumber: string | undefined;

      if (detectedBank === 'BANCO_GENERAL') {
        // Formato tipico BG: Fecha, Descripcion, Referencia, Debito, Credito, Saldo
        date = parseStatementDate(cols[0]);
        rawDescription = cols[1];
        referenceNumber = cols[2] || undefined;
        const debitCents = parseMoneyToCents(cols[3]);
        const creditCents = parseMoneyToCents(cols[4]);

        if (debitCents > 0) {
          amountInCents = debitCents;
          type = 'EXPENSE';
        } else if (creditCents > 0) {
          amountInCents = creditCents;
          type = 'INCOME';
        }
      } else if (detectedBank === 'BAC_CREDOMATIC') {
        // Formato tipico BAC: Fecha, Descripcion, Monto, Tipo
        date = parseStatementDate(cols[0]);
        rawDescription = cols[1];
        const valCents = parseMoneyToCents(cols[2]);
        const typeStr = (cols[3] || '').toUpperCase();
        amountInCents = valCents;
        type = typeStr.includes('CRED') || typeStr.includes('PAGO') ? 'INCOME' : 'EXPENSE';
      } else {
        // Formato generico / Banistmo: Fecha, Descripcion, Monto (negativo debito / positivo credito)
        date = parseStatementDate(cols[0]);
        rawDescription = cols[1];
        const rawAmount = cols[2];
        const isNegative = rawAmount.includes('-') || (cols[3] && cols[3].toUpperCase().includes('DR'));
        amountInCents = parseMoneyToCents(rawAmount);
        type = isNegative ? 'EXPENSE' : 'INCOME';
      }

      if (!rawDescription || amountInCents <= 0) continue;

      const norm = normalizeMerchant(rawDescription);

      const parsedTx: ParsedStatementTransaction = {
        date,
        rawDescription,
        normalizedMerchant: norm.merchantName,
        suggestedCategoryId: norm.suggestedCategoryId,
        confidenceScore: norm.confidence,
        amountInCents,
        type,
        referenceNumber
      };

      result.transactions.push(parsedTx);
      result.totalParsed++;

      if (type === 'INCOME') {
        result.totalIncomeInCents += amountInCents;
      } else {
        result.totalExpenseInCents += amountInCents;
      }
    } catch (rowErr: any) {
      result.errors.push(`Error en linea ${i + 1}: ${rowErr.message}`);
    }
  }

  return result;
}
