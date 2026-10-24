import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export function normalizeServiceError(error: unknown): ServiceError {
  if (error instanceof ServiceError) return error;
  if (error instanceof ZodError) return new ServiceError("VALIDATION_ERROR", "Request validation failed", 400, error.flatten());
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return new ServiceError("CONFLICT", "A record with these values already exists", 409);
    if (error.code === "P2025") return new ServiceError("NOT_FOUND", "Record not found", 404);
  }
  if (error instanceof Error && error.name === "UnauthorizedError") return new ServiceError("UNAUTHENTICATED", error.message, 401);
  return new ServiceError("INTERNAL_ERROR", "The operation could not be completed", 500);
}
