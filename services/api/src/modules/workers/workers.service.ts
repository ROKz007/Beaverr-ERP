import { workersRepository } from "./workers.repository";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";

export const workersService = {
  async list(societyId: string, filter: { q?: string; skill?: string; isAvailable?: boolean }, pagination: Pagination) {
    const [workers, total] = await workersRepository.list(societyId, filter, pagination);
    return { workers, total };
  },

  async getById(societyId: string, id: string) {
    const worker = await workersRepository.findById(societyId, id);
    if (!worker) {
      throw new AppError("NOT_FOUND", "Worker not found.", 404);
    }
    return worker;
  },

  create: workersRepository.create,
  update: workersRepository.update,
  softDelete: workersRepository.softDelete,

  /** Moves ratingAvg toward the new rating (EMA) and nudges reputationScore up/down around a rating of 3. */
  async recordRating(worker: { id: string; ratingAvg: number; reputationScore: number }, rating: number) {
    const ratingAvg = worker.ratingAvg === 0 ? rating : worker.ratingAvg * 0.8 + rating * 0.2;
    const reputationScore = Math.max(0, Math.min(100, worker.reputationScore + (rating - 3) * 5));
    return workersRepository.update(worker.id, { ratingAvg, reputationScore });
  },
};
