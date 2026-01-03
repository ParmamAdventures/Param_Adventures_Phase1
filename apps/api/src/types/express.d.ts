
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
      permissions?: string[]; // Augmening Request to include permissions
    }
  }
}

export {};
