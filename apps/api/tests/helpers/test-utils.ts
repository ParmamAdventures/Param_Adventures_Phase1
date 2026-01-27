import { Request, Response, NextFunction } from "express";

export const mockRequest = (
  data: {
    body?: Record<string, unknown>;
    params?: Record<string, string>;
    query?: Record<string, unknown>;
    user?: unknown;
    headers?: Record<string, string>;
  } = {},
): Request => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    user: data.user,
    headers: data.headers || {},
    get: jest.fn((header: string) => data.headers?.[header]),
  } as unknown as Request;
};

export const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res as Response;
};

export const mockNext = (): NextFunction => {
  return jest.fn();
};
