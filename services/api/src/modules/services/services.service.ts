import { servicesRepository } from "./services.repository";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";
import type { ServiceCategory } from "@repo/types";

export const servicesService = {
  async list(societyId: string, filter: { q?: string; category?: ServiceCategory }, pagination: Pagination) {
    const [services, total] = await servicesRepository.list(societyId, filter, pagination);
    return { services, total };
  },

  async getById(societyId: string, id: string) {
    const service = await servicesRepository.findById(societyId, id);
    if (!service) {
      throw new AppError("NOT_FOUND", "Service not found.", 404);
    }
    return service;
  },

  create: servicesRepository.create,
  update: servicesRepository.update,
  softDelete: servicesRepository.softDelete,
};
