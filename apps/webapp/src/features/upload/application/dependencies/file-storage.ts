import { Result } from "@prj-conq/lib/patterns";

export interface ICloudFileStorage {
  upload(file: File, filename: string): Promise<Result<void>>;
  download(filename: string): Promise<Result<File>>;
}

export interface ILocalFileStorage {
  save(filename: string, file: File): Promise<Result<{ tempFilePath: string }>>;
}
