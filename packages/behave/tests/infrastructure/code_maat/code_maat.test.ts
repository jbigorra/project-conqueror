import { CodeMaat } from "#infra/code_maat/code_maat.ts";
import { CLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  Mock,
} from "bun:test";
import path from "node:path";

describe("CodeMaat", () => {
  let spawnAsyncMock: Mock<TSpawnAsyncFn>;
  let codeMaat: CodeMaat;
  const expectedJarPath = path.join(
    __dirname,
    "../../../",
    "src/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar",
  );

  beforeEach(() => {
    spawnAsyncMock = mock<TSpawnAsyncFn>();
    codeMaat = new CodeMaat(spawnAsyncMock);
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  it("should spawn a process with the correct arguments", async () => {
    spawnAsyncMock.mockResolvedValue(
      new CLIResult(0, "key1,key2\nvalue1,value2\n", ""),
    );
    const args = ["-a", "analysis_type", "-c", "git2", "--log", "path/to/log"];

    await codeMaat.execute(args);

    const expectedArgs = ["-jar", expectedJarPath, ...args];
    expect(spawnAsyncMock).toHaveBeenCalledWith("java", expectedArgs);
  });

  it("should return an error if the command fails", async () => {
    spawnAsyncMock.mockResolvedValue(
      new CLIResult(1, "", "error", new Error("error message")),
    );
    const args = ["-a", "analysis_type", "-c", "git2", "--log", "path/to/log"];

    const result = await codeMaat.execute(args);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe("error message");
  });

  it("should return success when file is processed", async () => {
    spawnAsyncMock.mockResolvedValue(
      new CLIResult(0, "key1,key2\nvalue1,value2\n", ""),
    );

    const args = ["-a", "analysis_type", "-c", "git2", "--log", "path/to/log"];

    const result = await codeMaat.execute(args);

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().stdout).toBe("key1,key2\nvalue1,value2\n");
  });
});
