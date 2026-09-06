import { Router } from "express";
import { forumController } from "./forum.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { injectSocietyId } from "../../middleware/tenancy.middleware";
import { requireRole } from "../../middleware/rbac.middleware";

export const forumRoutes = Router();

forumRoutes.use(requireAuth, injectSocietyId);
forumRoutes.get("/threads", forumController.list);
forumRoutes.get("/threads/:id", forumController.getById);
forumRoutes.post("/threads", forumController.createThread);
forumRoutes.post("/threads/:id/replies", forumController.reply);

export const adminForumRoutes = Router();

adminForumRoutes.use(requireAuth, injectSocietyId, requireRole("SOCIETY_ADMIN"));
adminForumRoutes.get("/threads", forumController.listForAdmin);
adminForumRoutes.patch("/threads/:id/flag", forumController.setFlag);
adminForumRoutes.delete("/threads/:id", forumController.removeThread);
adminForumRoutes.delete("/replies/:id", forumController.removeReply);
