export interface User {
  id: string;
  email: string;
  name?: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}
