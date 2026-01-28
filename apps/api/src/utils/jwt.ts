import * as jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../config/env";

/**
 * JWT payload interface.
 * @interface JwtPayload
 * @property {string} sub - Subject (user ID)
 * @property {string} jti - JWT ID for revocation
 */
export interface JwtPayload {
  sub: string; // userId
  jti: string; // unique token ID
}

/**
 * Sign JWT access token with configured TTL.
 * @param {string} userId - User ID to encode in token
 * @returns {string} - Signed JWT access token
 */
export function signAccessToken(userId: string) {
  const opts: jwt.SignOptions = { expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"] };
  return jwt.sign({ sub: userId, jti: randomUUID() }, env.JWT_ACCESS_SECRET as string, opts);
}

/**
 * Sign JWT refresh token with configured TTL.
 * @param {string} userId - User ID to encode in token
 * @returns {string} - Signed JWT refresh token
 */
export function signRefreshToken(userId: string) {
  const opts: jwt.SignOptions = {
    expiresIn: env.REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: userId, jti: randomUUID() }, env.JWT_REFRESH_SECRET as string, opts);
}

/**
 * Verify and decode JWT access token.
 * @param {string} token - JWT token to verify
 * @returns {JwtPayload} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export function signResetToken(userId: string) {
  return jwt.sign(
    { sub: userId, jti: randomUUID() },
    env.JWT_ACCESS_SECRET as string, // Resusing access secret for now, ideally dedicated secret
    { expiresIn: "15m" },
  );
}

export function verifyResetToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}
