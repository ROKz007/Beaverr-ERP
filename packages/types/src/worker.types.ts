export interface Worker {
  id: string;
  societyId: string;
  name: string;
  phone: string;
  skills: string[];
  ratingAvg: number;
  reputationScore: number;
  isVerified: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}
