declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      name?: string;
      roles: string[];
      permissions?: string[];
    }

    interface Request {
      user?: User; // Explicitly adding user to Request to satisfy Render/TS
      permissions?: string[];
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
    }
  }
}

export {};
