import { parse } from "csv-parse/sync";
import { residentsRepository } from "./residents.repository";
import { AppError } from "../../utils/AppError";
import type { Pagination } from "../../utils/pagination";

interface CsvRow {
  name?: string;
  phone?: string;
  email?: string;
}

export const residentsService = {
  async list(societyId: string, pagination: Pagination) {
    const [residents, total] = await residentsRepository.list(societyId, pagination);
    return { residents, total };
  },

  async getById(societyId: string, id: string) {
    const resident = await residentsRepository.findById(societyId, id);
    if (!resident) {
      throw new AppError("NOT_FOUND", "Resident not found.", 404);
    }
    return resident;
  },

  async create(societyId: string, data: { name: string; phone: string; email?: string }) {
    const existing = await residentsRepository.findByPhone(societyId, data.phone);
    if (existing) {
      throw new AppError("VALIDATION_ERROR", "A resident with this phone number already exists.", 400);
    }
    return residentsRepository.create(societyId, data);
  },

  update(id: string, data: { name?: string; email?: string; avatarUrl?: string }) {
    return residentsRepository.update(id, data);
  },

  suspend(id: string, isActive: boolean) {
    return residentsRepository.setActive(id, isActive);
  },

  softDelete(id: string) {
    return residentsRepository.softDelete(id);
  },

  async bulkImport(societyId: string, csvBuffer: Buffer) {
    const rows = parse(csvBuffer, { columns: true, skip_empty_lines: true, trim: true }) as CsvRow[];
    const errors: { row: number; message: string }[] = [];
    let success = 0;

    for (const [index, row] of rows.entries()) {
      try {
        if (!row.name || !row.phone) {
          throw new Error("Missing required column: name and phone are both required.");
        }
        const existing = await residentsRepository.findByPhone(societyId, row.phone);
        if (existing) {
          throw new Error(`Phone ${row.phone} already registered.`);
        }
        await residentsRepository.create(societyId, { name: row.name, phone: row.phone, email: row.email });
        success += 1;
      } catch (err) {
        errors.push({ row: index + 1, message: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    return { success, failed: errors.length, errors };
  },
};
