import { documentsRepository } from "./documents.repository";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";

export const documentsService = {
  async list(societyId: string, pagination: Pagination) {
    const [documents, total] = await documentsRepository.list(societyId, pagination);
    return { documents, total };
  },

  create: documentsRepository.create,

  async remove(societyId: string, id: string) {
    const document = await documentsRepository.findById(societyId, id);
    if (!document) throw new AppError("NOT_FOUND", "Document not found.", 404);
    return documentsRepository.remove(id);
  },
};
