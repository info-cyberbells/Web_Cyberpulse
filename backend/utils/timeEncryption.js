import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = process.env.TIME_ENCRYPTION_KEY
  ? Buffer.from(process.env.TIME_ENCRYPTION_KEY, 'hex')
  : crypto.randomBytes(32); // fallback for dev, but .env key should be set

const IV_LENGTH = 16;
const ENCRYPTED_PREFIX = 'enc:';

/**
 * Encrypt a time string (e.g., "2025-03-10T09:30:00.000Z")
 * Returns "enc:<iv_hex>:<encrypted_hex>" format
 */
export const encryptTime = (timeStr) => {
  if (!timeStr) return timeStr;
  // Already encrypted, skip
  if (typeof timeStr === 'string' && timeStr.startsWith(ENCRYPTED_PREFIX)) return timeStr;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(String(timeStr), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${ENCRYPTED_PREFIX}${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Time encryption error:', err.message);
    return timeStr; // return original on error
  }
};

/**
 * Decrypt a time string
 * Handles both encrypted ("enc:...") and plain (legacy) values
 */
export const decryptTime = (encryptedStr) => {
  if (!encryptedStr) return encryptedStr;
  // Not encrypted (legacy data), return as-is
  if (typeof encryptedStr !== 'string' || !encryptedStr.startsWith(ENCRYPTED_PREFIX)) {
    return encryptedStr;
  }

  try {
    const parts = encryptedStr.slice(ENCRYPTED_PREFIX.length).split(':');
    if (parts.length !== 2) return encryptedStr;

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Time decryption error:', err.message);
    return encryptedStr; // return as-is on error
  }
};
