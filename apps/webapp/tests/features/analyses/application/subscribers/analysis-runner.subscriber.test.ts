import { AnalysisRunnerSubscriber } from "#analyses/application/subscribers/analysis-runner.subscriber.ts";
import type { ICloudFileStorage, ILocalFileStorage } from "#shared/dependencies/file-storage.ts";
import { FileUploadedEvent } from "#shared/domain/events/file-uploaded-event.ts";
import { AnalysisOptions, type Behave } from "@prj-conq/behave";
import { Result } from "@prj-conq/lib/patterns";
import { mockFn, type MockProxy } from "bun-automock";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

describe("AnalysisRunnerSubscriber", async () => {
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

  it("should save the file to a temporary directory", async () => {
    const expectedFile = new File(["Test content"], "uuidFilename.log", { type: "text/plain" });
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

  it("should return error result when behave fails to run the analysis", async () => {
    const expectedFile = new File(["Test content"], "uuidFilename.log", { type: "text/plain" });
    temporaryStorage.save.mockResolvedValue(Result.success({ tempFilePath: "absolute/path/to/uuidFilename.log" }));
    behave.runAnalysis.mockResolvedValue(new Error("Analysis failed"));

    const { success, error } = await sut.handle(
      new FileUploadedEvent({
        filename: "uuidFilename.log",
        file: expectedFile,
      }),
    );

    expect(success).toBe(false);
    expect(error?.message).toBe("Analysis failed");
  });
});
/**
 * Consider if the following tasks are required:
 * Introduce application services:
 * - [ ] TemporaryStorageService should save the file to a temporary directory and persist in the database
 *    - [ ] Remove cloudstorage and save always to temp file with the help of the TemporaryStorageService. This requires a new dependency in the subscriber.
 *    - [ ] A worker is required to maintain the temp storage and cleans up the files after a certain time.
 * - [ ] AnalysisService should handle the creation of more than one type of analysis and persist to the database the corresponding data.
 */
