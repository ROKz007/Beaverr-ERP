export type ServiceCategory = "MAINTENANCE" | "AMENITY" | "COMMUNITY";

export interface Service {
  id: string;
  societyId: string;
  name: string;
  description: string;
  category: ServiceCategory;
  subCategory: string;
  isPaid: boolean;
  price: number | null;
  slaHours: number;
  durationEstMins: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
