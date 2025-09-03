import { ObjectStorageError } from "#error.ts";
import type { IFileStorage } from "#upload/application/dependencies/file-storage.js";
import { Result } from "@prj-conq/lib/patterns";
import { S3Client } from "bun";

export class S3FileStorage implements IFileStorage {
  constructor(private readonly s3Client: S3Client) {}

  async upload(file: File, filename: string): Promise<Result<void>> {
    try {
      const fileContent = await file.text();
      await this.s3Client.write(filename, fileContent);

      return Result.success(undefined);
    } catch (e: any) {
      const error = new ObjectStorageError(`${S3FileStorage.name}: upload failed`, {
        cause: e,
      });
      return Result.error(error);
    }
  }

  async download(file: File): Promise<Result<void>> {
    throw new Error("Not implemented");
  }
}
