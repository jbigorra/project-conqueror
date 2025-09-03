import { Result } from "@prj-conq/lib/patterns";

export interface IFileStorage {
  upload(file: File, filename: string): Promise<Result<void>>;
  download(file: File): Promise<Result<void>>;
}
