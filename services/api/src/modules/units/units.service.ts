import { unitsRepository } from "./units.repository";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";

export const unitsService = {
  async list(societyId: string, pagination: Pagination) {
    const [units, total] = await unitsRepository.list(societyId, pagination);
    return { units, total };
  },

  async getById(societyId: string, id: string) {
    const unit = await unitsRepository.findById(societyId, id);
    if (!unit) {
      throw new AppError("NOT_FOUND", "Unit not found.", 404);
    }
    return unit;
  },

  create(societyId: string, data: Parameters<typeof unitsRepository.create>[1]) {
    return unitsRepository.create(societyId, data);
  },

  async update(societyId: string, id: string, data: Parameters<typeof unitsRepository.update>[1]) {
    await unitsService.getById(societyId, id);
    return unitsRepository.update(id, data);
  },

  async transfer(societyId: string, id: string, data: { ownerUserId?: string; tenantUserId?: string }) {
    await unitsService.getById(societyId, id);
    return unitsRepository.transfer(id, data);
  },
};
