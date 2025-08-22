import { Result } from "@prj-conq/lib/patterns";

export interface IFileStorage {
  upload(file: File): Promise<Result<void>>;
  download(file: File): Promise<Result<void>>;
}

export class FileStorage implements IFileStorage {
  async upload(file: File): Promise<Result<void>> {
    console.log("uploading file: ", file.name);
    return Result.success(undefined);
  }

  async download(file: File): Promise<Result<void>> {
    console.log("downloading file: ", file.name);
    return Result.success(undefined);
  }
}

type Deps = {
  fileStorage: IFileStorage;
};

export class UploadFile {
  static create(deps: Deps = { fileStorage: new FileStorage() }) {
    return new UploadFile(deps.fileStorage);
  }

  constructor(private readonly fileStorage: IFileStorage) {}

  async execute(file: File): Promise<Result<void>> {
    // const file = await this.file.text();
    // await Bun.file(BUCKET_PATH + "/" + Date.now() + "-" + file.name).write(
    //   file,
    // );

    const result = await this.fileStorage.upload(file);

    if (result.isError()) {
      return Result.error(result.getError());
    }

    return Result.success(undefined);
  }
}
