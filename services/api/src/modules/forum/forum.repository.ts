import { prisma } from "../../config/database";
import type { Pagination } from "../../utils/pagination";
import type { ForumCategory } from "@repo/types";

export const forumRepository = {
  listThreads(societyId: string, filter: { category?: ForumCategory }, pagination: Pagination) {
    const where = { societyId, isRemoved: false, ...(filter.category ? { category: filter.category } : {}) };
    return prisma.$transaction([
      prisma.forumThread.findMany({
        where,
        include: { _count: { select: { replies: true } } },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.forumThread.count({ where }),
    ]);
  },

  listThreadsForAdmin(societyId: string, pagination: Pagination) {
    const where = { societyId };
    return prisma.$transaction([
      prisma.forumThread.findMany({
        where,
        include: { _count: { select: { replies: true } } },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.forumThread.count({ where }),
    ]);
  },

  findThreadById(societyId: string, id: string) {
    return prisma.forumThread.findFirst({
      where: { id, societyId },
      include: { replies: { where: { isRemoved: false }, orderBy: { createdAt: "asc" } } },
    });
  },

  createThread(societyId: string, authorUserId: string, data: { category: ForumCategory; title: string; body: string }) {
    return prisma.forumThread.create({ data: { societyId, authorUserId, ...data } });
  },

  setThreadFlag(id: string, isFlagged: boolean) {
    return prisma.forumThread.update({ where: { id }, data: { isFlagged } });
  },

  setThreadRemoved(id: string, isRemoved: boolean) {
    return prisma.forumThread.update({ where: { id }, data: { isRemoved } });
  },

  createReply(threadId: string, authorUserId: string, body: string) {
    return prisma.forumReply.create({ data: { threadId, authorUserId, body } });
  },

  findReplyById(id: string) {
    return prisma.forumReply.findUnique({ where: { id } });
  },

  setReplyRemoved(id: string, isRemoved: boolean) {
    return prisma.forumReply.update({ where: { id }, data: { isRemoved } });
  },
};
