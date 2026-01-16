export interface AuthenticatedUser {
  id: string;
  roles: string[];
  permissions: string[];
}

export interface GuestDetail {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  [key: string]: string | number | undefined;
}

export type GuestDetails = GuestDetail[] | Record<string, unknown>;
