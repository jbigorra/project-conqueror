import type { FileUploadedEvent } from "#shared/domain/events/file-uploaded-event.ts";
import type { ICloudFileStorage, ILocalFileStorage } from "#upload/application/dependencies/file-storage.ts";
import { LocalFileStorage } from "#upload/infrastructure/fs/file-storage.ts";
import { S3FileStorage } from "#upload/infrastructure/http/s3-file-storage.ts";
import BehaveInstance, { type Behave, AnalysisOptions } from "@prj-conq/behave";
import { type EventHandler, type EventHandlerResult } from "@prj-conq/lib/patterns";

type Deps = {
  fileStorage?: ICloudFileStorage;
  temporaryStorage?: ILocalFileStorage;
  behave?: Behave;
};

export class AnalysisRunnerSubscriber implements EventHandler<FileUploadedEvent> {
  eventType: string = "upload.FileUploaded";
  handlerName: string = AnalysisRunnerSubscriber.name;

  static create(deps: Deps) {
    // note: Bun.s3 by default reads from .env file to get the config and credentials
    const {
      fileStorage = new S3FileStorage(Bun.s3),
      temporaryStorage = new LocalFileStorage(),
      behave = BehaveInstance.create(),
    } = deps;

    return new AnalysisRunnerSubscriber(fileStorage, temporaryStorage, behave);
  }

  constructor(
    private readonly fileStorage: ICloudFileStorage,
    private readonly temporaryStorage: ILocalFileStorage,
    private readonly behave: Behave,
  ) {}

  async handle(event: FileUploadedEvent): Promise<EventHandlerResult> {
    const downloadResult = await this.fileStorage.download(event.payload["filename"]);

    if (downloadResult.isError()) {
      return { success: false, error: downloadResult.getError() };
    }

    const file = downloadResult.getValue();

    const saveResult = await this.temporaryStorage.save(event.payload["filename"], file);

    if (saveResult.isError()) {
      return { success: false, error: saveResult.getError() };
    }

    await this.behave.runAnalysis(
      new AnalysisOptions({
        analysisType: "main-dev",
        logFile: saveResult.getValue().tempFilePath,
        rows: "20",
        minRevs: "5",
        minSharedRevs: "2",
      }),
    );

    return { success: true };
  }
}

// receive event
// fetch the file from the file storage
// save the file to the local filesystem in a temporary directory
// pass it to behave to do the analysis
// save the analysis result to S3 and the database
// return success
/**
 * possible analyses:
 * 1. main-dev (knowledge distribution)
 * 2. entity-churn (most refactored entities)
 * 3. change-coupling (most coupled files)
 * 4.
 */
