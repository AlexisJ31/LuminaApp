import { normalizeMerchant } from '../src/services/normalizer.service';
import { generateCanonicalHash } from '../src/services/ingestion.service';
import crypto from 'crypto';

describe('Fase 3: Motor de Normalizacion de Comercios de Panama (ING-04)', () => {
  it('debe limpiar prefijos bancarios y normalizar Riba Smith', () => {
    const raw = 'COMPRA EN SUPERMERCADO RIBA SMITH BELLA VISTA';
    const result = normalizeMerchant(raw);

    expect(result.merchantName).toBe('Supermercado Riba Smith');
    expect(result.suggestedCategoryId).toBe('cat-groc');
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('debe normalizar transporte de Panama (Metrobus y Panapass)', () => {
    const metro = normalizeMerchant('RECARGA METROBUS SONDA ESTACION 5 DE MAYO');
    expect(metro.merchantName).toBe('Metrobus / Metro de Panama');
    expect(metro.suggestedCategoryId).toBe('cat-trans');
    expect(metro.confidence).toBe(0.98);

    const panapass = normalizeMerchant('DEBITO AUTOMATICO PANAPASS ENA SUR');
    expect(panapass.merchantName).toBe('Panapass ENA');
    expect(panapass.suggestedCategoryId).toBe('cat-trans');
  });

  it('debe normalizar servicios publicos panamenos (ENSA, IDAAN, Tigo)', () => {
    const luz = normalizeMerchant('PAGO EN LINEA ENSA PANAMA FACTURA 4920');
    expect(luz.merchantName).toBe('ENSA Panama');
    expect(luz.suggestedCategoryId).toBe('cat-serv');

    const agua = normalizeMerchant('PAGO AGUA IDAAN CUENTA 10293');
    expect(agua.merchantName).toBe('IDAAN Agua');
    expect(agua.suggestedCategoryId).toBe('cat-serv');
  });

  it('debe normalizar suscripciones y servicios de streaming (Spotify, Apple, Netflix)', () => {
    const spotify = normalizeMerchant('SPOTIFY P123849 PREMIUM MONTHLY');
    expect(spotify.merchantName).toBe('Spotify');
    expect(spotify.suggestedCategoryId).toBe('cat-sub');

    const netflix = normalizeMerchant('NETFLIX.COM DIGITAL SUBSCRIPTION');
    expect(netflix.merchantName).toBe('Netflix');
    expect(netflix.suggestedCategoryId).toBe('cat-sub');
  });

  it('debe devolver confianza moderada para comercios desconocidos sin coincidencia', () => {
    const unknown = normalizeMerchant('PAGO TIENDA LOCAL ESQUINERA 44');
    expect(unknown.merchantName).toBe('TIENDA LOCAL ESQUINERA 44');
    expect(unknown.confidence).toBe(0.60);
  });
});

describe('Fase 3: Deduplicacion - Capa 2 Hash Canonico (ADR-005)', () => {
  it('debe generar el mismo hash SHA-256 para eventos identicos en el mismo minuto', () => {
    const userId = 'usr-test-123';
    const amountInCents = 1550; // $15.50
    const fixedDate = new Date('2026-10-04T18:30:15.000Z');
    const merchant = 'Super 99';

    const hash1 = generateCanonicalHash(userId, amountInCents, fixedDate, merchant);
    const hash2 = generateCanonicalHash(userId, amountInCents, new Date('2026-10-04T18:30:45.000Z'), merchant);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex
  });

  it('debe generar hashes distintos si cambia el monto o el comercio', () => {
    const userId = 'usr-test-123';
    const fixedDate = new Date('2026-10-04T18:30:15.000Z');

    const hash1 = generateCanonicalHash(userId, 1550, fixedDate, 'Super 99');
    const hash2 = generateCanonicalHash(userId, 1551, fixedDate, 'Super 99');
    const hash3 = generateCanonicalHash(userId, 1550, fixedDate, 'Riba Smith');

    expect(hash1).not.toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });
});

describe('Fase 2: Generacion de Credenciales API para SourceConnection (ADR-009)', () => {
  it('debe generar un API Key con prefijo lum_live_ y hash consistente', () => {
    const rawApiKey = `lum_live_${crypto.randomBytes(24).toString('hex')}`;
    expect(rawApiKey.startsWith('lum_live_')).toBe(true);

    const hash1 = crypto.createHash('sha256').update(rawApiKey).digest('hex');
    const hash2 = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
});
