import { prisma } from "../../config/database";

export const societiesRepository = {
  findByCode(code: string) {
    return prisma.society.findUnique({ where: { code } });
  },

  findById(id: string) {
    return prisma.society.findUnique({ where: { id } });
  },

  updateProfile(id: string, data: { name?: string; address?: string }) {
    return prisma.society.update({ where: { id }, data });
  },

  setGateModule(id: string, isRestrictedEntry: boolean) {
    return prisma.society.update({ where: { id }, data: { isRestrictedEntry } });
  },

  listDepartments(societyId: string) {
    return prisma.department.findMany({ where: { societyId }, orderBy: { name: "asc" } });
  },

  createDepartment(societyId: string, data: { name: string; contactName?: string; phone?: string; email?: string; workingHours?: string }) {
    return prisma.department.create({ data: { societyId, ...data } });
  },

  updateDepartment(id: string, data: Partial<{ name: string; contactName: string; phone: string; email: string; workingHours: string }>) {
    return prisma.department.update({ where: { id }, data });
  },

  deleteDepartment(id: string) {
    return prisma.department.delete({ where: { id } });
  },
};
