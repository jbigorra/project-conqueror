import { Result } from "@prj-conq/lib/patterns";
import type { ILocalFileStorage } from "../../dependencies/file-storage";

export class LocalFileStorage implements ILocalFileStorage {
  async save(filename: string, file: File): Promise<Result<{ tempFilePath: string }>> {
    throw new Error("Not implemented");
  }
}
