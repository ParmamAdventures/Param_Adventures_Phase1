import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Encrypts sensitive configuration values using bcryptjs
 * Suitable for passwords and API keys that need one-way hashing
 * @param value - The plaintext value to encrypt
 * @returns The encrypted hash
 */
export async function encryptSensitiveValue(value: string): Promise<string> {
  try {
    return await bcrypt.hash(value, SALT_ROUNDS);
  } catch (error) {
    console.error("Failed to encrypt sensitive value:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Verifies an encrypted value against its plaintext version
 * @param plaintext - The plaintext value to verify
 * @param encrypted - The encrypted hash to compare against
 * @returns True if values match, false otherwise
 */
export async function verifySensitiveValue(plaintext: string, encrypted: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plaintext, encrypted);
  } catch (error) {
    console.error("Failed to verify sensitive value:", error);
    return false;
  }
}

/**
 * Factory function to create encryption/decryption handlers
 * Encapsulates encryption logic for reusability
 */
export const EncryptionService = {
  encrypt: encryptSensitiveValue,
  verify: verifySensitiveValue,

  /**
   * Checks if a value appears to be encrypted (bcrypt hash format)
   * Bcrypt hashes always start with $2a, $2b, or $2x
   */
  isEncrypted(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
  },
};
