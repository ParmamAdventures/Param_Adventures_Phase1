
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      roles: string[]; // Simplification given CI error on Role enum sometimes
      permissions?: string[];
    }
  }
}

export {};
