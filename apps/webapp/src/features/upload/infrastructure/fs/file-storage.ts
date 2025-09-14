import type { ILocalFileStorage } from "#upload/application/dependencies/file-storage.ts";
import { Result } from "@prj-conq/lib/patterns";

export class LocalFileStorage implements ILocalFileStorage {
  async save(filename: string, file: File): Promise<Result<{ tempFilePath: string }>> {
    throw new Error("Not implemented");
  }
}
