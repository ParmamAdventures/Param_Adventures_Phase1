import * as jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string; // userId
}

export function signAccessToken(userId: string) {
  const opts: jwt.SignOptions = { expiresIn: env.ACCESS_TOKEN_TTL as any };
  return jwt.sign(
    { sub: userId },
    env.JWT_ACCESS_SECRET as unknown as jwt.Secret,
    opts
  );
}

export function signRefreshToken(userId: string) {
  const opts: jwt.SignOptions = { expiresIn: env.REFRESH_TOKEN_TTL as any };
  return jwt.sign(
    { sub: userId },
    env.JWT_REFRESH_SECRET as unknown as jwt.Secret,
    opts
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}
