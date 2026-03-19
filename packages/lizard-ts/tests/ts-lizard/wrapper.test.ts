import { describe, expect, it } from "bun:test";
import { Result } from "@prj-conq/lib/patterns";
import { CLIResult } from "@prj-conq/lib/processes";
import { mockFn } from "bun-automock";
import type { ICLIExecutor } from "#lizard/ts-lizard/infrastructure/interfaces.ts";
import { Lizard } from "#lizard/ts-lizard/wrapper.ts";

describe("Lizard", () => {
  it("should return raw stdout when analysis succeeds", async () => {
    const executor = mockFn<ICLIExecutor>();
    const csvOutput =
      '6,1,34,1,7,"create@18-24@./path/to/file.ts","/path/to/file.ts","create","create ( deps : Deps )",18,24';
    executor.execute.mockResolvedValue(
      Result.success(new CLIResult(0, csvOutput, "")),
    );
    const lizard = new Lizard(executor);

    const result = await lizard.analyze("/path/to/source");

    expect(executor.execute.spy()).toHaveBeenCalledWith([
      "/path/to/source",
      "--csv",
    ]);
    expect(result).toBe(lizard.CSV_HEADERS + csvOutput);
  });

  it("should return an error when analysis fails", async () => {
    const executor = mockFn<ICLIExecutor>();
    const expectedError = new Error("python3 not found");
    executor.execute.mockResolvedValue(Result.error(expectedError));
    const lizard = new Lizard(executor);

    const result = await lizard.analyze("/path/to/source");

    expect(result).toEqual(expectedError);
  });

  it("should prepend the correct headers to the csv file", async () => {
    const executor = mockFn<ICLIExecutor>();
    const csvOutput =
      '6,1,34,1,7,"create@18-24@./path/to/file.ts","/path/to/file.ts","create","create ( deps : Deps )",18,24';
    executor.execute.mockResolvedValue(
      Result.success(new CLIResult(0, csvOutput, "")),
    );
    const lizard = new Lizard(executor);

    const result = await lizard.analyze("/path/to/source");

    expect(executor.execute.spy()).toHaveBeenCalledWith([
      "/path/to/source",
      "--csv",
    ]);
    expect(result).toBe(lizard.CSV_HEADERS + csvOutput);
  });
});
