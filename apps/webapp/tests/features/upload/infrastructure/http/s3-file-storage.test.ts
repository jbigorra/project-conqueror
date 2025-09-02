import { ObjectStorageError } from "#error.ts";
import { S3FileStorage } from "#upload/infrastructure/http/s3-file-storage.ts";
import { S3Client } from "bun";
import { mockFn } from "bun-automock";
import { describe, expect, it } from "bun:test";

describe.only("S3FileStorage", () => {
  it("should upload a file to S3 compatible object storage", async () => {
    const s3Client = mockFn<S3Client>();
    const fileStorage = new S3FileStorage(s3Client);
    const file = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    const result = await fileStorage.upload(file);

    expect(result.isSuccess()).toBe(true);
    expect(s3Client.write.spy()).toHaveBeenCalledWith("test.log", "Test content");
  });

  it("should return error result when uploading file throws an error", async () => {
    const s3Client = mockFn<S3Client>();
    const fileStorage = new S3FileStorage(s3Client);
    const error = new Error("Upload failed", { cause: "some error" });
    (error as any).code = "OBJECT_STORAGE_ERROR";
    s3Client.write.mockRejectedValue(error);
    const file = new File(["Test content"], "test.log", {
      type: "text/plain",
    });

    const result = await fileStorage.upload(file);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe(`${S3FileStorage.name}: upload failed`);
    expect(result.getError()).toBeInstanceOf(ObjectStorageError);
  });
});
