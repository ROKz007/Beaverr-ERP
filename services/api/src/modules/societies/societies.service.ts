import { societiesRepository } from "./societies.repository";
import { AppError } from "../../utils/AppError";

export const societiesService = {
  async validateCode(code: string) {
    const society = await societiesRepository.findByCode(code);
    if (!society) {
      throw new AppError("SOCIETY_CODE_INVALID", "Society code not found.", 400);
    }
    return { name: society.name, code: society.code };
  },

  async getProfile(societyId: string) {
    const society = await societiesRepository.findById(societyId);
    if (!society) {
      throw new AppError("NOT_FOUND", "Society not found.", 404);
    }
    return society;
  },

  updateProfile(societyId: string, data: { name?: string; address?: string }) {
    return societiesRepository.updateProfile(societyId, data);
  },

  setGateModule(societyId: string, isRestrictedEntry: boolean) {
    return societiesRepository.setGateModule(societyId, isRestrictedEntry);
  },

  listDepartments(societyId: string) {
    return societiesRepository.listDepartments(societyId);
  },

  createDepartment(societyId: string, data: Parameters<typeof societiesRepository.createDepartment>[1]) {
    return societiesRepository.createDepartment(societyId, data);
  },

  updateDepartment(id: string, data: Parameters<typeof societiesRepository.updateDepartment>[1]) {
    return societiesRepository.updateDepartment(id, data);
  },

  deleteDepartment(id: string) {
    return societiesRepository.deleteDepartment(id);
  },
};
