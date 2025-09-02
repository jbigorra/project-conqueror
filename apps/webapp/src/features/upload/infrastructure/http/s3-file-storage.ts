import type { IFileStorage } from "#upload/application/dependencies/file-storage.js";
import { Result } from "@prj-conq/lib/patterns";
import { S3Client } from "bun";

export class S3FileStorage implements IFileStorage {
  constructor(private readonly s3Client: S3Client) {}

  async upload(file: File): Promise<Result<void>> {
    try {
      const fileContent = await file.text();
      await this.s3Client.write(file.name, fileContent);

      return Result.success(undefined);
    } catch (e: any) {
      const error = new Error(`${S3FileStorage.name}: upload failed`, {
        cause: e.cause,
      });
      error.code = "OBJECT_STORAGE_ERROR";
      return Result.error(error);
    }
  }

  async download(file: File): Promise<Result<void>> {
    throw new Error("Not implemented");
  }
}
