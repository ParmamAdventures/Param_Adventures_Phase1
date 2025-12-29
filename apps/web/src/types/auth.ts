export interface User {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
  bio?: string;
  age?: number;
  gender?: string;
  phoneNumber?: string;
  address?: string;
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
  preferences: any;
}
