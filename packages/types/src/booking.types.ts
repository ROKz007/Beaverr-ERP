export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "RATED";

export interface ServiceBooking {
  id: string;
  societyId: string;
  serviceId: string;
  residentId: string;
  workerId: string | null;
  status: BookingStatus;
  scheduledAt: string;
  completedAt: string | null;
  rating: number | null;
  ratingNote: string | null;
  createdAt: string;
  updatedAt: string;
  service: { id: string; name: string; category: string; subCategory: string };
  worker: { id: string; name: string; phone: string; ratingAvg: number } | null;
  /** Only present on list results (admin-web); resident-web already knows who it is. */
  resident?: { id: string; name: string; phone: string } | null;
}
