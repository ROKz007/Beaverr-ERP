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

  async update(societyId: string, id: string, data: Parameters<typeof servicesRepository.update>[1]) {
    await servicesService.getById(societyId, id);
    return servicesRepository.update(id, data);
  },

  async softDelete(societyId: string, id: string) {
    await servicesService.getById(societyId, id);
    return servicesRepository.softDelete(id);
  },
};
