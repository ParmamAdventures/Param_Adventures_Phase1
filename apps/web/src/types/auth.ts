export interface User {
  id: string;
  email: string;
  name?: string;
  bio?: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  roles: string[];
  permissions: string[];
  avatarImage?: {
    id: string;
    originalUrl: string;
    mediumUrl: string;
    thumbUrl: string;
  };
}
