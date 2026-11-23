// Shared error helpers. Keep the API surface predictable: { error: string }.

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(status: number, message: string) {
  return { error: message };
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
