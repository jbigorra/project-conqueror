import type { IBaseRepository } from "#shared/generics-types/repository.ts";
import type { Upload } from "#upload/core/entities/upload.ts";
import type { Result } from "@prj-conq/lib/patterns";

export class UploadsRepository implements IBaseRepository<Upload> {
  async insertOne(upload: Upload): Promise<Result<Upload>> {
    throw new Error("Not implemented");
  }
}
