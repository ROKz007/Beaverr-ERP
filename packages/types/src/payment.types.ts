export type PaymentType = "MAINTENANCE" | "SERVICE";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  societyId: string;
  userId: string;
  unitId: string;
  amount: number;
  type: PaymentType;
  gatewayRef: string | null;
  status: PaymentStatus;
  dueDate: string | null;
  paidAt: string | null;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
