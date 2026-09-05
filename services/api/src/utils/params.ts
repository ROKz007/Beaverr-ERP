import type { Request } from "express";
import { AppError } from "./AppError";

/** Express types params as string | string[] | undefined under noUncheckedIndexedAccess; route params are always plain strings in practice. */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") {
    throw new AppError("VALIDATION_ERROR", `Missing route parameter: ${name}`, 400);
  }
  return value;
}
