import { forumRepository } from "./forum.repository";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";
import type { ForumCategory } from "@repo/types";

function withReplyCount<T extends { _count: { replies: number } }>(thread: T) {
  const { _count, ...rest } = thread;
  return { ...rest, replyCount: _count.replies };
}

export const forumService = {
  async list(societyId: string, filter: { category?: ForumCategory }, pagination: Pagination) {
    const [rawThreads, total] = await forumRepository.listThreads(societyId, filter, pagination);
    return { threads: rawThreads.map(withReplyCount), total };
  },

  async listForAdmin(societyId: string, pagination: Pagination) {
    const [rawThreads, total] = await forumRepository.listThreadsForAdmin(societyId, pagination);
    return { threads: rawThreads.map(withReplyCount), total };
  },

  /** Resident-facing — 404s on a removed thread, same as if it never existed. */
  async getById(societyId: string, id: string) {
    const thread = await forumRepository.findVisibleThreadById(societyId, id);
    if (!thread) throw new AppError("NOT_FOUND", "Thread not found.", 404);
    return thread;
  },

  /** Admin-facing tenancy check — finds a thread regardless of removed state. */
  async assertExists(societyId: string, id: string) {
    const thread = await forumRepository.findThreadById(societyId, id);
    if (!thread) throw new AppError("NOT_FOUND", "Thread not found.", 404);
    return thread;
  },

  async createThread(
    societyId: string,
    authorUserId: string,
    data: { category: ForumCategory; title: string; body: string },
  ) {
    return forumRepository.createThread(societyId, authorUserId, data);
  },

  async reply(societyId: string, threadId: string, authorUserId: string, body: string) {
    await forumService.getById(societyId, threadId);
    return forumRepository.createReply(threadId, authorUserId, body);
  },

  /** Resident-facing "report" — any authenticated user can flag a thread for review, they just
   * can't unflag it (only admin's setFlag can clear the flag). */
  async report(societyId: string, id: string) {
    await forumService.getById(societyId, id);
    return forumRepository.setThreadFlag(id, true);
  },

  async setFlag(societyId: string, id: string, isFlagged: boolean) {
    await forumService.assertExists(societyId, id);
    return forumRepository.setThreadFlag(id, isFlagged);
  },

  async removeThread(societyId: string, id: string) {
    await forumService.assertExists(societyId, id);
    return forumRepository.setThreadRemoved(id, true);
  },

  async removeReply(societyId: string, id: string) {
    const reply = await forumRepository.findReplyById(id);
    if (!reply) throw new AppError("NOT_FOUND", "Reply not found.", 404);
    await forumService.assertExists(societyId, reply.threadId);
    return forumRepository.setReplyRemoved(id, true);
  },
};
