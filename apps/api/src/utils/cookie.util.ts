import { Response, CookieOptions } from "express";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/**
 * Sets the refresh token cookie on the response.
 * @param res Express response object.
 * @param token The refresh token.
 */
export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refresh_token", token, cookieOptions);
};

/**
 * Clears the refresh token cookie from the response.
 * @param res Express response object.
 */
export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refresh_token", cookieOptions);
};
