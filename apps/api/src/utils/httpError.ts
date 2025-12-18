import { Response } from "express";

export function httpError(
  res: Response,
  status: number,
  code: string,
  message: string
) {
  return res.status(status).json({ error: { code, message } });
}

export default httpError;
