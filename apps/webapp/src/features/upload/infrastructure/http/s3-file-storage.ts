import { Result } from "@prj-conq/lib/patterns";
import type { S3Client } from "bun";
import { ObjectStorageError } from "#error.ts";
import type { ICloudFileStorage } from "#shared/dependencies/file-storage.ts";

export class S3FileStorage implements ICloudFileStorage {
  constructor(private readonly s3Client: S3Client) {}

  async upload(file: File, filename: string): Promise<Result<void>> {
    try {
      const fileContent = await file.text();
      await this.s3Client.write(filename, fileContent);

      return Result.success(undefined);
    } catch (e: unknown) {
      const error = new ObjectStorageError(`${S3FileStorage.name}: upload failed`, {
        cause: e,
      });
      return Result.error(error);
    }
  }

  async download(filename: string): Promise<Result<File>> {
    throw new Error("Not implemented");
  }
}
