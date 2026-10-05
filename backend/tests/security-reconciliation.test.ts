import { encryptSecret, decryptSecret } from '../src/lib/crypto';
import { calculateTextSimilarity } from '../src/services/reconciliation.service';

describe('Fase 9: Cifrado en Reposo AES-256-GCM (ADR-009)', () => {
  const secretPayload = JSON.stringify({
    apiKey: 'pk_live_panama_banking_secret_99812',
    institution: 'banco_general_pa'
  });

  it('debe cifrar y descifrar un secreto de forma simetrica exacta', () => {
    const encrypted = encryptSecret(secretPayload);
    expect(encrypted).not.toBe(secretPayload);
    expect(encrypted.split(':')).toHaveLength(3); // iv:tag:data

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(secretPayload);
  });

  it('debe generar IVs unicos para dos llamadas consecutivas con el mismo texto plano', () => {
    const enc1 = encryptSecret(secretPayload);
    const enc2 = encryptSecret(secretPayload);

    expect(enc1).not.toBe(enc2); // Ciphertexts diferentes por IV aleatorio

    expect(decryptSecret(enc1)).toBe(secretPayload);
    expect(decryptSecret(enc2)).toBe(secretPayload);
  });

  it('debe fallar la autenticacion si el tag o los datos cifrados son manipulados', () => {
    const encrypted = encryptSecret(secretPayload);
    const parts = encrypted.split(':');
    // Alterar un caracter del texto cifrado
    const tamperedData = parts[2].substring(0, parts[2].length - 2) + 'aa';
    const tampered = `${parts[0]}:${parts[1]}:${tamperedData}`;

    expect(() => decryptSecret(tampered)).toThrow();
  });
});

describe('Fase 8: Motor de Conciliacion - Similaridad de Texto (Fuzzy Matching)', () => {
  it('debe otorgar puntaje 1.0 para descripciones identicas', () => {
    const sim = calculateTextSimilarity('Supermercado Riba Smith', 'Supermercado Riba Smith');
    expect(sim).toBe(1.0);
  });

  it('debe otorgar alto puntaje (> 0.75) para variaciones con prefijos o detalles menores', () => {
    const sim = calculateTextSimilarity('Uber Panama Trip', 'Uber Panama');
    expect(sim).toBeGreaterThanOrEqual(0.75);

    const sim2 = calculateTextSimilarity('Farmacias Arrocha Calle 50', 'Farmacias Arrocha');
    expect(sim2).toBeGreaterThanOrEqual(0.70);
  });

  it('debe otorgar bajo puntaje (< 0.30) para transacciones completamente distintas', () => {
    const sim = calculateTextSimilarity('Pago Netflix Streaming', 'Restaurante Maito');
    expect(sim).toBeLessThan(0.30);
  });
});
