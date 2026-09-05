export type Role = "RESIDENT" | "GUARD" | "DEPT_HEAD" | "SOCIETY_ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  societyId: string;
  name: string;
  email: string | null;
  phone: string;
  role: Role;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
