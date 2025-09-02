import type { Result } from "@prj-conq/lib/patterns";

export interface IBaseRepository<T> {
  insertOne(
    entity: Omit<T, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<Result<T>>;
}
