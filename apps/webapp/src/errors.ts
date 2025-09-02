export type TErrorCodes = "pq_OBJECT_STORAGE_ERROR" | "pq_DATABASE_ERROR" | "pq_SERVER_ERROR";
class CustomBaseError extends Error {
  code: TErrorCodes;

  constructor(code: TErrorCodes, message: string, cause: unknown) {
    super(message, { cause });
    this.code = code;
  }
}
class ObjectStorageError extends CustomBaseError {
  constructor(message: string, cause: unknown) {
    super("pq_OBJECT_STORAGE_ERROR", message, cause);
  }
}
class DatabaseError extends CustomBaseError {
  constructor(message: string, cause: unknown) {
    super("pq_DATABASE_ERROR", message, cause);
  }
}

export { DatabaseError, ObjectStorageError };
