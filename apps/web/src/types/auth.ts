export interface User {
  id: string;
  email: string;
  name?: string;
  nickname?: string;
  bio?: string;
  age?: number;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  phoneNumber?: string;
  address?: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  statusReason?: string;
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
