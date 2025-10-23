/**
 * Security utility functions for preventing timing attacks and other vulnerabilities
 */

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if strings are equal, false otherwise
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate that a string contains only safe characters for object property access
 * @param key The key to validate
 * @returns true if the key is safe to use for object access
 */
export function isSafeObjectKey(key: string): boolean {
  // Allow only alphanumeric characters, hyphens, and underscores
  return /^[a-zA-Z0-9_-]+$/.test(key);
}
