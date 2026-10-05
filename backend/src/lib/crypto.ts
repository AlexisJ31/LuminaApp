import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recomendado para GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Obtiene la clave maestra de cifrado derivada a 32 bytes (256 bits)
 */
function getMasterKey(customSecret?: string): Buffer {
  const secret = customSecret || process.env.ENCRYPTION_KEY_SECRET || 'lumina_master_vault_key_2026_aes256gcm';
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedData {
  iv: string;
  authTag: string;
  data: string;
  serialized: string; // Formato empaquetado iv:tag:data
}

/**
 * Cifra un texto plano utilizando AES-256-GCM (ADR-009)
 */
export function encryptSecret(plainText: string, customSecret?: string): string {
  if (!plainText) return '';

  const key = getMasterKey(customSecret);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Descifra un secreto empaquetado en formato iv:tag:data utilizando AES-256-GCM (ADR-009)
 */
export function decryptSecret(serializedCipher: string, customSecret?: string): string {
  if (!serializedCipher) return '';

  const parts = serializedCipher.split(':');
  if (parts.length !== 3) {
    throw new Error('Formato de secreto cifrado invalido (esperado iv:tag:data)');
  }

  const [ivHex, tagHex, dataHex] = parts;
  const key = getMasterKey(customSecret);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(dataHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
