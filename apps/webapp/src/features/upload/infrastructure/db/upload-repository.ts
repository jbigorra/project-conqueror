import { DatabaseError } from "#error.ts";
import { getDevelopmentDatabase } from "#shared/database/db.ts";
import type { IBaseRepository, InsertEntity, RepoReturns } from "#shared/generics-types/repository.ts";
import { Upload } from "#upload/core/entities/upload.ts";
import { Result } from "@prj-conq/lib/patterns";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { uploadsTable } from "./schemas/uploads.sql";

type Deps = {
  db?: BunSQLiteDatabase;
};

export class UploadRepository implements IBaseRepository<Upload> {
  static create(deps: Deps) {
    const { db = getDevelopmentDatabase() } = deps;
    return new UploadRepository(db);
  }

  constructor(private readonly db: BunSQLiteDatabase) {}

  async insertOne(entity: InsertEntity<Upload>): RepoReturns<Upload> {
    try {
      const result = await this.db.insert(uploadsTable).values(entity).returning();
      const dbRow = result[0]!;

      return Result.success(Upload.fromDbRow(dbRow));
    } catch (e: unknown) {
      return Result.error(new DatabaseError(`${UploadRepository.name}: insertOne failed`, e));
    }
  }
}
