import { AnalysisRunnerSubscriber } from "#analyses/application/subscribers/analysis-runner.subscriber.ts";
import { FileUploadedEvent } from "#shared/domain/events/file-uploaded-event.ts";
import type { ICloudFileStorage, ILocalFileStorage } from "#upload/application/dependencies/file-storage.ts";
import { AnalysisOptions, type Behave } from "@prj-conq/behave";
import { Result } from "@prj-conq/lib/patterns";
import { mockFn, MockProxy } from "bun-automock";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe.only("AnalysisRunnerSubscriber", async () => {
  let sut: AnalysisRunnerSubscriber;
  let fileStorage: MockProxy<ICloudFileStorage>;
  let temporaryStorage: MockProxy<ILocalFileStorage>;
  let behave: MockProxy<Behave>;

  beforeEach(() => {
    fileStorage = mockFn<ICloudFileStorage>();
    temporaryStorage = mockFn<ILocalFileStorage>();
    behave = mockFn<Behave>();
    sut = AnalysisRunnerSubscriber.create({
      fileStorage,
      temporaryStorage,
      behave,
    });
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  it("should fetch the file content from the file storage", async () => {
    const expectedFile = new File(["Test content"], "uuidFilename.log", {
      type: "text/plain",
    });
    fileStorage.download.mockResolvedValue(Result.success(expectedFile));
    temporaryStorage.save.mockResolvedValue(Result.success({ tempFilePath: "absolute/path/to/uuidFilename.log" }));

    await sut.handle(
      new FileUploadedEvent({
        filename: "uuidFilename.log",
        file: expectedFile,
      }),
    );

    expect(fileStorage.download.spy()).toHaveBeenCalledWith("uuidFilename.log");
  });

  it("should return error result when file storage fails to download the file", async () => {
    fileStorage.download.mockResolvedValue(Result.error(new Error("File not found")));

    const { success, error } = await sut.handle(
      new FileUploadedEvent({
        filename: "uuidFilename.log",
        file: new File(["Test content"], "test.log", { type: "text/plain" }),
      }),
    );

    expect(success).toBe(false);
    expect(error?.message).toBe("File not found");
  });

  it("should save the file to a temporary directory", async () => {
    const expectedFile = new File(["Test content"], "uuidFilename.log", { type: "text/plain" });
    fileStorage.download.mockResolvedValue(Result.success(expectedFile));
    temporaryStorage.save.mockResolvedValue(Result.success({ tempFilePath: "absolute/path/to/uuidFilename.log" }));

    await sut.handle(
      new FileUploadedEvent({
        filename: "uuidFilename.log",
        file: expectedFile,
      }),
    );

    expect(temporaryStorage.save.spy()).toHaveBeenCalledWith("uuidFilename.log", expectedFile);
  });

  it("should return error result when temporary storage fails to save the file", async () => {
    const expectedFile = new File(["Test content"], "uuidFilename.log", { type: "text/plain" });
    fileStorage.download.mockResolvedValue(Result.success(expectedFile));
    temporaryStorage.save.mockResolvedValue(Result.error(new Error("Saving to temp directory failed")));

    const { success, error } = await sut.handle(
      new FileUploadedEvent({
        filename: "uuidFilename.log",
        file: expectedFile,
      }),
    );

    expect(success).toBe(false);
    expect(error?.message).toBe("Saving to temp directory failed");
  });

  it("should produce the main-dev analysis by analysing the gitlog file with the analysis tool (behave)", async () => {
    const expectedFile = new File(["Test content"], "uuidFilename.log", { type: "text/plain" });
    fileStorage.download.mockResolvedValue(Result.success(expectedFile));
    temporaryStorage.save.mockResolvedValue(Result.success({ tempFilePath: "absolute/path/to/uuidFilename.log" }));
    behave.runAnalysis.mockResolvedValue([]);

    await sut.handle(
      new FileUploadedEvent({
        filename: "uuidFilename.log",
        file: expectedFile,
      }),
    );

    expect(behave.runAnalysis.spy()).toHaveBeenCalledWith(
      new AnalysisOptions({
        analysisType: "main-dev",
        logFile: "absolute/path/to/uuidFilename.log",
        rows: "20",
        minRevs: "5",
        minSharedRevs: "2",
      }),
    );
  });

  it("should return sucess result when the analysis is produced successfully", async () => {
    const expectedFile = new File(["Test content"], "uuidFilename.log", { type: "text/plain" });
    fileStorage.download.mockResolvedValue(Result.success(expectedFile));
    temporaryStorage.save.mockResolvedValue(Result.success({ tempFilePath: "absolute/path/to/uuidFilename.log" }));
    behave.runAnalysis.mockResolvedValue([]);

    const { success } = await sut.handle(
      new FileUploadedEvent({
        filename: "uuidFilename.log",
        file: expectedFile,
      }),
    );

    expect(success).toBe(true);
  });
});

// TemporaryStorageService should save the file to a temporary directory and persist in the database
// Remove cloudstorage and save always to temp file. This requires worker that maintains
// the temp storage and cleans up the files after a certain time.
