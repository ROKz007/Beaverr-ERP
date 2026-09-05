import { prisma } from "../../config/database";

export const authRepository = {
  findSocietyByCode(code: string) {
    return prisma.society.findUnique({ where: { code } });
  },

  findUserByPhone(phone: string) {
    return prisma.user.findFirst({ where: { phone, deletedAt: null } });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findSocietyById(id: string) {
    return prisma.society.findUnique({ where: { id } });
  },

  createResident(params: { societyId: string; name: string; phone: string; email?: string }) {
    return prisma.user.create({
      data: {
        societyId: params.societyId,
        name: params.name,
        phone: params.phone,
        email: params.email,
        role: "RESIDENT",
      },
    });
  },

  updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return prisma.user.update({ where: { id: userId }, data });
  },
};
