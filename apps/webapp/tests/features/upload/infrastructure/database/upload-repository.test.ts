import { DatabaseError } from "#error.ts";
import { uploadsTable } from "#upload/infrastructure/db/schemas/uploads.sql.ts";
import { UploadRepository } from "#upload/infrastructure/db/upload-repository.ts";
import { describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { setupTestDatabase } from "../../../../helpers/database";

describe("UploadRepository", () => {
  it("should insert one upload into the database and return domain entity", async () => {
    const db = await setupTestDatabase();
    const uploadRepository = new UploadRepository(db);

    const result = await uploadRepository.insertOne({ identifier: "someUuid" });

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        identifier: "someUuid",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
      }),
    );
    const expectedDbRecord = (await db.select().from(uploadsTable).where(eq(uploadsTable.identifier, "someUuid")))[0];
    expect(expectedDbRecord.identifier).toBe("someUuid");
  });

  it("should return error when inserting throws an error", async () => {
    const db = await setupTestDatabase();
    const uploadRepository = new UploadRepository(db);

    // @ts-expect-error - testing the error case
    const result = await uploadRepository.insertOne({ identifier: null });

    const actualError = result.getError();
    expect(result.isError()).toBe(true);
    expect(result.getError()).toBeInstanceOf(DatabaseError);
    expect(actualError).toEqual(
      expect.objectContaining({
        message: `${UploadRepository.name}: insertOne failed`,
        code: "pq_DATABASE_ERROR",
        cause: expect.any(Error),
      }),
    );
  });
});
