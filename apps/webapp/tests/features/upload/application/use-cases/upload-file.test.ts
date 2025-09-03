import type { IBaseRepository } from "#shared/generics-types/repository.ts";
import type { IFileStorage } from "#upload/application/dependencies/file-storage.ts";
import { UploadFile } from "#upload/application/use-cases/upload-file.ts";
import { Upload } from "#upload/core/entities/upload.ts";
import { EventBus, Result } from "@prj-conq/lib/patterns";
import { mockFn, type MockProxy } from "bun-automock";
import { beforeEach, describe, expect, it, Mock, mock } from "bun:test";

describe("UploadFile", () => {
  let fileStorage: MockProxy<IFileStorage>;
  let eventBus: MockProxy<EventBus>;
  let uploadFile: UploadFile;
  let uploadsRepository: MockProxy<IBaseRepository<Upload>>;
  const TEST_UUIDV7 = "test-uuidv7";
  const UUIDv7: Mock<() => string> = mock(() => TEST_UUIDV7);

  beforeEach(() => {
    fileStorage = mockFn<IFileStorage>();
    eventBus = mockFn<EventBus>();
    uploadsRepository = mockFn<IBaseRepository<Upload>>();
    uploadFile = UploadFile.create({
      fileStorage: fileStorage,
      eventBus: eventBus,
      uploadsRepository,
      UUIDv7,
    });
  });

  it("should upload the file to the file storage with a uuid as filename", async () => {
    UUIDv7.mockReturnValue(TEST_UUIDV7);
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    uploadsRepository.insertOne.mockResolvedValue(
      Result.success<Upload>({
        id: 1,
        identifier: TEST_UUIDV7,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    const validFile = new File(["Test content"], `test.log`, {
      type: "text/plain",
    });

    await uploadFile.execute(validFile);

    expect(fileStorage.upload.spy()).toHaveBeenCalledWith(validFile, `${TEST_UUIDV7}.log`);
  });

  it.only("should log the file uploaded in the database", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    uploadsRepository.insertOne.mockResolvedValue(
      Result.success<Upload>({
        id: 1,
        identifier: TEST_UUIDV7,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    await uploadFile.execute(validFile);

    expect(uploadsRepository.insertOne.spy()).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: TEST_UUIDV7,
      }),
    );
  });

  it.only("should produce FileUploadedEvent when file is uploaded successfully", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    uploadsRepository.insertOne.mockResolvedValue(
      Result.success<Upload>({
        id: 1,
        identifier: TEST_UUIDV7,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    await uploadFile.execute(validFile);

    const expectedFileName = `${TEST_UUIDV7}.log`;
    expect(eventBus.publish.spy()).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "upload.FileUploaded",
        aggregateId: expectedFileName,
        payload: { filename: expectedFileName },
      }),
    );
  });

  it("should return success result when file is uploaded successfully", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    uploadsRepository.insertOne.mockResolvedValue(
      Result.success<Upload>({
        id: 1,
        identifier: "someUuid",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    const result = await uploadFile.execute(validFile);

    expect(result.isSuccess()).toBe(true);
  });

  it("should return error result when uploader fails to upload the file", async () => {
    fileStorage.upload.mockResolvedValue(Result.error(new Error("Upload failed")));

    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    const result = await uploadFile.execute(validFile);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe("Upload failed");
  });

  it("should return error result when file does not have a .log extension", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    uploadsRepository.insertOne.mockResolvedValue(
      Result.success<Upload>({
        id: 1,
        identifier: "someUuid",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    );
    const invalidFile = new File(["Test content"], "test.txt", {
      type: "text/plain",
    });

    const result = await uploadFile.execute(invalidFile);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe("File does not have a .log extension");
  });

  it("should return error result when respository fails to log the file uploaded", async () => {
    fileStorage.upload.mockResolvedValue(Result.success(undefined));
    uploadsRepository.insertOne.mockResolvedValue(
      Result.error<Upload>(new Error("Failed to insertOne entry in the database")),
    );
    const validFile = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    const result = await uploadFile.execute(validFile);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe("Failed to insertOne entry in the database");
  });
});
