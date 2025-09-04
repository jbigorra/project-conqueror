import { getDevelopmentDatabase } from "#shared/database/db.ts";
import { FileUploadedEvent } from "#shared/domain/events/file-uploaded-event.ts";
import { EventBusInstance } from "#shared/event/event-bus.ts";
import type { IBaseRepository } from "#shared/generics-types/repository.ts";
import type { IUseCase } from "#shared/generics-types/usecase.ts";
import type { Upload } from "#upload/core/entities/upload.ts";
import { UploadRepository } from "#upload/infrastructure/db/upload-repository.ts";
import { S3FileStorage } from "#upload/infrastructure/http/s3-file-storage.ts";
import { type EventBus, Result } from "@prj-conq/lib/patterns";
import { randomUUIDv7 } from "bun";
import type { IFileStorage } from "../dependencies/file-storage.ts";

type Deps = {
  fileStorage?: IFileStorage;
  eventBus?: EventBus;
  uploadsRepository?: IBaseRepository<Upload>;
  UUIDv7?: () => string;
};

export class UploadFile implements IUseCase<File, void> {
  static create(deps: Deps) {
    // note: Bun.s3 by default reads from .env file to get the config and credentials
    const {
      fileStorage = new S3FileStorage(Bun.s3),
      eventBus = EventBusInstance.get(),
      uploadsRepository = UploadRepository.create({ db: getDevelopmentDatabase() }),
      UUIDv7 = () => randomUUIDv7(),
    } = deps;

    return new UploadFile(fileStorage, eventBus, uploadsRepository, UUIDv7);
  }

  constructor(
    private readonly fileStorage: IFileStorage,
    private readonly eventBus: EventBus,
    private readonly uploadsRepository: IBaseRepository<Upload>,
    private readonly UUIDv7: () => string,
  ) {}

  async execute(file: File): Promise<Result<void>> {
    const fileExtension = file.name.split(".").pop();

    if (fileExtension !== "log") {
      return Result.error(new Error("File does not have a .log extension"));
    }
    const identifier = this.UUIDv7();
    const filename = `${identifier}.log`;

    const uploadResult = await this.fileStorage.upload(file, filename);

    if (uploadResult.isError()) {
      return Result.error(uploadResult.getError());
    }

    const insertResult = await this.uploadsRepository.insertOne({
      identifier: identifier,
    });

    if (insertResult.isError()) {
      return Result.error(insertResult.getError());
    }

    this.eventBus.publish(new FileUploadedEvent({ filename: filename }));

    return Result.success(undefined);
  }
}
