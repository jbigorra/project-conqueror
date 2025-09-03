import type { Result } from "@prj-conq/lib/patterns";

/**
 * Domain entity for business logic - guarantees non-null required fields
 * Use this for all business logic to avoid nullable checks
 *
 * @example
 * ```typescript
 * export class Upload extends DomainEntity {
 *   id: number;
 *   identifier: string;
 *   createdAt: Date;
 *   updatedAt: Date;
 *   deletedAt: Date | null;
 * }
 * ```
 */
export abstract class DomainEntity {
  abstract id: number;
  abstract createdAt: Date;
  abstract updatedAt: Date;
  abstract deletedAt: Date | null; // Set only when the entity is deleted
}

// Repository Input types (work with partial data for creation)
export type InsertEntity<T extends DomainEntity> = Omit<T, "id" | "createdAt" | "updatedAt" | "deletedAt">;
export type UpdateEntity<T extends DomainEntity> = Pick<T, "id"> &
  Partial<Omit<T, "id" | "createdAt" | "updatedAt" | "deletedAt">>;
export type FindEntity<T extends DomainEntity> = Partial<Omit<T, "id">>;

// Repository return type
export type RepoReturns<TResult> = Promise<Result<TResult>>;
/**
 * Base repository interface that all domain repositories should implement
 *
 * @example
 * ```typescript
 * export class UploadRepository implements IBaseRepository<Upload> {
 *   async insertOne(entity: InsertEntity<Upload>): RepositoryResult<Upload> {
 *     // implementation
 *   }
 *   async updateOne(entity: UpdateEntity<Upload>): RepositoryResult<Upload> {
 *     // implementation
 *   }
 *   async findById(id: number): RepositoryResult<Upload> {
 *     // implementation
 *   }
 *   async findOne(entity: FindEntity<Upload>): RepositoryResult<Upload> {
 *     // implementation
 *   }
 *   async deleteOne(id: number): RepositoryResult<Upload> {
 *     // implementation
 *   }
 * }
 * ```
 */
export interface IBaseRepository<T extends DomainEntity> {
  insertOne(entity: InsertEntity<T>): RepoReturns<T>;
  updateOne?(entity: UpdateEntity<T>): RepoReturns<T>;
  findById?(id: number): RepoReturns<T | null>;
  findOne?(entity: FindEntity<T>): RepoReturns<T | null>;
  deleteOne?(id: number): RepoReturns<T>;
}
