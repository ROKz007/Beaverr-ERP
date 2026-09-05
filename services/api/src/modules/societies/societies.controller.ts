import type { Request, Response } from "express";
import { societiesService } from "./societies.service";
import { updateProfileSchema, gateModuleSchema, departmentSchema, updateDepartmentSchema } from "./societies.validator";
import { param } from "../../utils/params";

export const societiesController = {
  async validateCode(req: Request, res: Response) {
    const data = await societiesService.validateCode(param(req, "code"));
    res.json({ success: true, data });
  },

  async getProfile(req: Request, res: Response) {
    const data = await societiesService.getProfile(req.societyId!);
    res.json({ success: true, data });
  },

  async updateProfile(req: Request, res: Response) {
    const body = updateProfileSchema.parse(req.body);
    const data = await societiesService.updateProfile(req.societyId!, body);
    res.json({ success: true, data });
  },

  async setGateModule(req: Request, res: Response) {
    const { isRestrictedEntry } = gateModuleSchema.parse(req.body);
    const data = await societiesService.setGateModule(req.societyId!, isRestrictedEntry);
    res.json({ success: true, data });
  },

  async listDepartments(req: Request, res: Response) {
    const data = await societiesService.listDepartments(req.societyId!);
    res.json({ success: true, data });
  },

  async createDepartment(req: Request, res: Response) {
    const body = departmentSchema.parse(req.body);
    const data = await societiesService.createDepartment(req.societyId!, body);
    res.status(201).json({ success: true, data });
  },

  async updateDepartment(req: Request, res: Response) {
    const body = updateDepartmentSchema.parse(req.body);
    const data = await societiesService.updateDepartment(param(req, "id"), body);
    res.json({ success: true, data });
  },

  async deleteDepartment(req: Request, res: Response) {
    await societiesService.deleteDepartment(param(req, "id"));
    res.json({ success: true, data: { message: "Department deleted." } });
  },
};
