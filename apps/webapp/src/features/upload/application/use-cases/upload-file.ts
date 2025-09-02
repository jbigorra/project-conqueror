import { IUseCase } from "#shared/generics-types/usecase.ts";
import { FileUploadedEvent } from "#upload/core/events/file-uploaded-event.ts";
import { EventBus, Result } from "@prj-conq/lib/patterns";

export interface IFileStorage {
  upload(file: File): Promise<Result<void>>;
  download(file: File): Promise<Result<void>>;
}

export class FileStorage implements IFileStorage {
  async upload(file: File): Promise<Result<void>> {
    // const file = await this.file.text();
    // await Bun.file(BUCKET_PATH + "/" + Date.now() + "-" + file.name).write(
    //   file,
    // );
    console.log("uploading file: ", file.name);
    return Result.success(undefined);
  }

  async download(file: File): Promise<Result<void>> {
    console.log("downloading file: ", file.name);
    return Result.success(undefined);
  }
}

type Deps = {
  fileStorage?: IFileStorage;
  eventBus?: EventBus;
};

export class UploadFile implements IUseCase<File, void> {
  static create(deps: Deps) {
    // note: Bun.s3 by default reads from .env file to get the config and credentials
    const {
      fileStorage = new S3FileStorage(Bun.s3),
      eventBus = new EventBus(),
    } = deps;

    return new UploadFile(fileStorage, eventBus);
  }

  constructor(
    private readonly fileStorage: IFileStorage,
    private readonly eventBus: EventBus,
  ) {}

  async execute(file: File): Promise<Result<void>> {
    const fileExtension = file.name.split(".").pop();

    if (fileExtension !== "log") {
      return Result.error(new Error("File does not have a .log extension"));
    }

    const result = await this.fileStorage.upload(file);

    if (result.isError()) {
      return Result.error(result.getError());
    }

    this.eventBus.publish(new FileUploadedEvent({ filename: file.name }));

    return Result.success(undefined);
  }
}
