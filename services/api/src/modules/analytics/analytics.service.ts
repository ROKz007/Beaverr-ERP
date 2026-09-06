import { analyticsRepository } from "./analytics.repository";
import { paymentsService } from "../payments/payments.service";

export const analyticsService = {
  async dashboard(societyId: string) {
    const [openBookings, pendingGrievances, visitorsToday, dues] = await Promise.all([
      analyticsRepository.countOpenBookings(societyId),
      analyticsRepository.countPendingGrievances(societyId),
      analyticsRepository.countVisitorsToday(societyId),
      paymentsService.summary(societyId),
    ]);
    return { openBookings, pendingGrievances, visitorsToday, dues };
  },
};
