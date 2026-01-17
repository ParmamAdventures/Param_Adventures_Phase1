import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash password using bcryptjs with configured salt rounds.
 * Used for secure storage of passwords in database.
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify plain text password against bcrypt hash.
 * Used for password validation during login.
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Bcrypt hash from database
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
