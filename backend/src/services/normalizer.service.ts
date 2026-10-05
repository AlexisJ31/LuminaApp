export interface NormalizedMerchantResult {
  merchantName: string;
  suggestedCategoryId: string;
  confidence: number;
  matchedPattern?: string;
}

interface MerchantRule {
  pattern: RegExp;
  cleanName: string;
  categoryId: string;
  confidence: number;
}

// Catalogo canonico de patrones y comercios representativos de Panama
const PANAMA_MERCHANT_RULES: MerchantRule[] = [
  // Supermercados y Abarrotes
  { pattern: /riba\s*smith/i, cleanName: 'Supermercado Riba Smith', categoryId: 'cat-groc', confidence: 0.95 },
  { pattern: /super\s*99|supermercados\s*99/i, cleanName: 'Super 99', categoryId: 'cat-groc', confidence: 0.95 },
  { pattern: /super\s*xtra|supermercado\s*xtra/i, cleanName: 'Super Xtra', categoryId: 'cat-groc', confidence: 0.95 },
  { pattern: /el\s*rey|supermercados\s*rey/i, cleanName: 'Supermercados Rey', categoryId: 'cat-groc', confidence: 0.95 },
  { pattern: /el\s*machetazo/i, cleanName: 'El Machetazo', categoryId: 'cat-groc', confidence: 0.92 },
  { pattern: /pricesmart/i, cleanName: 'PriceSmart Panama', categoryId: 'cat-groc', confidence: 0.95 },

  // Restaurantes, Cafeterias y Salidas
  { pattern: /niko'?s\s*cafe/i, cleanName: "Niko's Cafe", categoryId: 'cat-rest', confidence: 0.95 },
  { pattern: /mcdonald'?s/i, cleanName: "McDonald's", categoryId: 'cat-rest', confidence: 0.95 },
  { pattern: /starbucks/i, cleanName: 'Starbucks', categoryId: 'cat-rest', confidence: 0.95 },
  { pattern: /subway/i, cleanName: 'Subway', categoryId: 'cat-rest', confidence: 0.92 },
  { pattern: /kfc|kentucky\s*fried/i, cleanName: 'KFC', categoryId: 'cat-rest', confidence: 0.95 },
  { pattern: /maito/i, cleanName: 'Restaurante Maito', categoryId: 'cat-rest', confidence: 0.92 },
  { pattern: /la\s*rana\s*dorada/i, cleanName: 'La Rana Dorada', categoryId: 'cat-rest', confidence: 0.90 },
  { pattern: /domino'?s\s*pizza|pizza\s*hut/i, cleanName: "Pizza Delivery", categoryId: 'cat-rest', confidence: 0.92 },

  // Transporte, Movilidad y Peajes
  { pattern: /uber(\s*trip|\s*panama)?/i, cleanName: 'Uber Panama', categoryId: 'cat-trans', confidence: 0.95 },
  { pattern: /didi(\s*mobility|\s*rides)?/i, cleanName: 'DiDi Panama', categoryId: 'cat-trans', confidence: 0.92 },
  { pattern: /panapass|ena\s*sur|ena\s*norte|corredor/i, cleanName: 'Panapass ENA', categoryId: 'cat-trans', confidence: 0.98 },
  { pattern: /metrobus|metro\s*de\s*panama|sonda/i, cleanName: 'Metrobus / Metro de Panama', categoryId: 'cat-trans', confidence: 0.98 },
  { pattern: /terpel|delta\s*petrol|puma\s*energy|texaco/i, cleanName: 'Estacion de Combustible', categoryId: 'cat-trans', confidence: 0.90 },

  // Servicios Publicos y Vivienda
  { pattern: /ensa|electrotecnica/i, cleanName: 'ENSA Panama', categoryId: 'cat-serv', confidence: 0.98 },
  { pattern: /naturgy|edemet|edechi/i, cleanName: 'Naturgy Panama', categoryId: 'cat-serv', confidence: 0.98 },
  { pattern: /idaan|acueductos/i, cleanName: 'IDAAN Agua', categoryId: 'cat-serv', confidence: 0.98 },
  { pattern: /cable\s*onda|tigo(\s*panama)?/i, cleanName: 'Tigo Telecomunicaciones', categoryId: 'cat-serv', confidence: 0.95 },
  { pattern: /\+movil|cw\s*panama|cable\s*&\s*wireless/i, cleanName: '+Movil Panama', categoryId: 'cat-serv', confidence: 0.95 },

  // Entretenimiento y Suscripciones Digitales
  { pattern: /spotify/i, cleanName: 'Spotify', categoryId: 'cat-sub', confidence: 0.98 },
  { pattern: /netflix/i, cleanName: 'Netflix', categoryId: 'cat-sub', confidence: 0.98 },
  { pattern: /apple(\.com|\s*music|\s*services)?/i, cleanName: 'Apple Services', categoryId: 'cat-sub', confidence: 0.95 },
  { pattern: /google(\s*storage|\s*one|\s*play)?/i, cleanName: 'Google Services', categoryId: 'cat-sub', confidence: 0.95 },
  { pattern: /chatgpt|openai/i, cleanName: 'OpenAI ChatGPT', categoryId: 'cat-sub', confidence: 0.98 },
  { pattern: /cinepolis|cinemark/i, cleanName: 'Cinepolis / Cinemark', categoryId: 'cat-sub', confidence: 0.95 },

  // Salud y Farmacias
  { pattern: /farmacias\s*arrocha|arrocha/i, cleanName: 'Farmacias Arrocha', categoryId: 'cat-groc', confidence: 0.92 },
  { pattern: /farmacias\s*metro/i, cleanName: 'Farmacias Metro', categoryId: 'cat-groc', confidence: 0.92 },

  // Ingresos / Nomina
  { pattern: /nomina|salario|pago\s*quincena|sueldo|payroll/i, cleanName: 'Nomina y Salario', categoryId: 'cat-salary', confidence: 0.98 }
];

// Limpieza de prefijos comunes en notificaciones bancarias panamenas
const PREFIXES_TO_STRIP = [
  /^COMPRA\s+(EN\s+|DE\s+)?/i,
  /^PAGO\s+(EN\s+|DE\s+|A\s+|POR\s+)?/i,
  /^TRANSF\.\s+(A\s+|DE\s+|EN\s+)?/i,
  /^TRANSFERENCIA\s+(A\s+|DE\s+|EN\s+)?/i,
  /^DEBITO\s+(POR\s+|DE\s+|EN\s+)?/i,
  /^CARGO\s+(POR\s+|DE\s+|EN\s+)?/i,
  /^POS\s+/i,
  /^ACH\s+/i,
  /^YAPPY\s+/i
];

/**
 * Normaliza la descripcion cruda de una transaccion para extraer el comercio y sugerir categoria
 */
export function normalizeMerchant(rawDescription: string): NormalizedMerchantResult {
  if (!rawDescription) {
    return {
      merchantName: 'Comercio Desconocido',
      suggestedCategoryId: 'cat-gen',
      confidence: 0.50
    };
  }

  // 1. Limpieza de prefijos bancarios
  let cleaned = rawDescription.trim();
  for (const prefix of PREFIXES_TO_STRIP) {
    cleaned = cleaned.replace(prefix, '').trim();
  }

  // 2. Busqueda determinista en catalogo de Panama
  for (const rule of PANAMA_MERCHANT_RULES) {
    if (rule.pattern.test(cleaned)) {
      return {
        merchantName: rule.cleanName,
        suggestedCategoryId: rule.categoryId,
        confidence: rule.confidence,
        matchedPattern: rule.pattern.source
      };
    }
  }

  // 3. Fallback heuristico si no hay match exacto
  return {
    merchantName: cleaned.length > 0 ? cleaned : 'Comercio General',
    suggestedCategoryId: 'cat-gen',
    confidence: 0.60
  };
}
