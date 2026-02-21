import { webcrypto } from 'node:crypto';

const ENCODER = new TextEncoder();

/**
 * Generate a new API key with `anim_` prefix.
 * Format: anim_<prefix8>_<secret>
 */
export async function generateApiKey(): Promise<{
  fullKey: string;
  prefix: string;
  keyHash: string;
}> {
  const bytes = new Uint8Array(32);
  webcrypto.getRandomValues(bytes);
  const raw = base64UrlEncode(bytes);
  const prefix = `anim_${raw.slice(0, 8)}`;
  const fullKey = `${prefix}_${raw.slice(8)}`;
  const keyHash = await hashApiKey(fullKey);
  return { fullKey, prefix, keyHash };
}

/**
 * SHA-256 hash of the full API key, hex-encoded.
 */
export async function hashApiKey(key: string): Promise<string> {
  const data = ENCODER.encode(key);
  const hashBuffer = await webcrypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify that a provided key matches a stored hash.
 */
export async function verifyApiKey(providedKey: string, storedHash: string): Promise<boolean> {
  const hash = await hashApiKey(providedKey);
  return hash === storedHash;
}

function base64UrlEncode(bytes: Uint8Array): string {
  const binStr = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
