/**
 * Secure cryptographic helper functions using standard browser Web Crypto API.
 */

/**
 * Generates a SHA-256 hash from a string.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if a string is a valid 64-character SHA-256 hex hash.
 */
export function isSha256(str: string): boolean {
  return /^[a-f0-9]{64}$/i.test(str);
}

/**
 * Hashes a password if it is not already hashed.
 */
export async function hashPasswordIfNeeded(password: string): Promise<string> {
  if (!password) return '';
  if (isSha256(password)) {
    return password;
  }
  return await hashPassword(password);
}
