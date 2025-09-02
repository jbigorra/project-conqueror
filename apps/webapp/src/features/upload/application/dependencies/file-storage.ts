import { Result } from "@prj-conq/lib/patterns";

export interface IFileStorage {
  upload(file: File): Promise<Result<void>>;
  download(file: File): Promise<Result<void>>;
}
