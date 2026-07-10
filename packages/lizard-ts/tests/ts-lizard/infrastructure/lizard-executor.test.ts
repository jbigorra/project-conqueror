import { afterEach, beforeEach, describe, expect, it, type Mock, mock } from "bun:test";
import { CLIResult, type TSpawnAsyncFn } from "@prj-conq/lib/processes";
import { LizardExecutor } from "#lizard/ts-lizard/infrastructure/lizard-executor.ts";

describe("LizardExecutor", () => {
  let spawnAsyncMock: Mock<TSpawnAsyncFn>;
  let executor: LizardExecutor;
  const fakePythonBin = "/fake/path/to/python3";

  beforeEach(() => {
    spawnAsyncMock = mock<TSpawnAsyncFn>();
    executor = new LizardExecutor(spawnAsyncMock, fakePythonBin);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  it("should spawn python3 with -m lizard and correct args", async () => {
    spawnAsyncMock.mockResolvedValue(new CLIResult(0, "output", ""));
    const args = ["/path/to/source"];

    await executor.execute(args);

    expect(spawnAsyncMock).toHaveBeenCalledWith(fakePythonBin, ["-m", "lizard", ...args]);
  });

  it("should return an error when the command fails", async () => {
    spawnAsyncMock.mockResolvedValue(
      new CLIResult(1, "", "error output", new Error("python3 failed")),
    );

    const result = await executor.execute(["/path/to/source"]);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe("python3 failed");
  });

  it("should return success with the CLI result", async () => {
    const expectedOutput = "file.ts: complexity 5\n";
    spawnAsyncMock.mockResolvedValue(new CLIResult(0, expectedOutput, ""));

    const result = await executor.execute(["/path/to/source"]);

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().stdout).toBe(expectedOutput);
  });

  it("should use default python binary when none provided", () => {
    const executorWithDefault = new LizardExecutor(spawnAsyncMock);
    expect(executorWithDefault).toBeDefined();
  });

  it("should return a Result.error when spawnAsync throws unexpectedly", async () => {
    spawnAsyncMock.mockRejectedValue(new Error("unexpected system error"));

    const result = await executor.execute(["/path/to/source"]);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe("unexpected system error");
  });
});
