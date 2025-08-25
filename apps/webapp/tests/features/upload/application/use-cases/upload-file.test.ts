import {
  IFileStorage,
  UploadFile,
} from "#upload/application/use-cases/upload-file.js";
import { EventBus, Result } from "@prj-conq/lib/patterns";
import { beforeEach, describe, expect, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

describe("UploadFile", () => {
  let fileStorage: MockProxy<IFileStorage>;
  let eventBus: MockProxy<EventBus>;
  let uploadFile: UploadFile;

  beforeEach(() => {
    fileStorage = mock<IFileStorage>();
    eventBus = mock<EventBus>();
    uploadFile = UploadFile.create({
      fileStorage,
      eventBus,
    });
  });

  it("should be should upload the file to the file storage", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    await uploadFile.execute(validFile);

    expect(fileStorage.upload).toHaveBeenCalledWith(validFile);
  });

  it("should produce FileUploadedEvent when file is uploaded successfully", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    await uploadFile.execute(validFile);

    const expectedFileName = "test.log";
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "upload.FileUploaded",
        aggregateId: expectedFileName,
        payload: { filename: expectedFileName },
      }),
    );
  });

  it("should return success result when file is uploaded successfully", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    const result = await uploadFile.execute(validFile);

    expect(result.isSuccess()).toBe(true);
  });

  it("should return error result when uploader fails to upload the file", async () => {
    fileStorage.upload.mockResolvedValue(
      Result.error(new Error("Upload failed")),
    );

    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    const result = await uploadFile.execute(validFile);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe("Upload failed");
  });

  it("should return error result when file does not have a .log extension", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    const invalidFile = new File(["Test content"], "test.txt", {
      type: "text/plain",
    });

    const result = await uploadFile.execute(invalidFile);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe(
      "File does not have a .log extension",
    );
  });
});
