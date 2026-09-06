import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { societiesRoutes } from "../modules/societies/societies.routes";
import { residentsRoutes } from "../modules/residents/residents.routes";
import { unitsRoutes } from "../modules/units/units.routes";
import { servicesRoutes } from "../modules/services/services.routes";
import { workersRoutes } from "../modules/workers/workers.routes";
import { bookingsRoutes } from "../modules/bookings/bookings.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/society", societiesRoutes);
apiRouter.use("/admin/residents", residentsRoutes);
apiRouter.use("/admin/units", unitsRoutes);
apiRouter.use("/services", servicesRoutes);
apiRouter.use("/admin/workers", workersRoutes);
apiRouter.use("/bookings", bookingsRoutes);
