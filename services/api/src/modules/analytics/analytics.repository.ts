import { prisma } from "../../config/database";

export const analyticsRepository = {
  countOpenBookings(societyId: string) {
    return prisma.serviceBooking.count({
      where: { societyId, deletedAt: null, status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] } },
    });
  },

  countPendingGrievances(societyId: string) {
    return prisma.grievance.count({
      where: { societyId, deletedAt: null, status: { in: ["OPEN", "IN_REVIEW"] } },
    });
  },

  countVisitorsToday(societyId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return prisma.visitor.count({ where: { societyId, createdAt: { gte: startOfDay } } });
  },
};
