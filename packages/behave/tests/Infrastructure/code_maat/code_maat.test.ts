import { CodeMaat } from "#behave/Infrastructure/code_maat/code_maat.js";
import { CLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, MockedFunction } from "vitest";
import { mockFn, mockReset } from "vitest-mock-extended";

describe("CodeMaat", () => {
  let spawnAsyncMock: MockedFunction<TSpawnAsyncFn>;
  let codeMaat: CodeMaat;
  const expectedJarPath = path.join(__dirname, "../../../", "src/Infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar");

  beforeEach(() => {
    spawnAsyncMock = mockFn<TSpawnAsyncFn>();
    codeMaat = new CodeMaat(spawnAsyncMock);
  });

  afterEach(() => {
    mockReset(spawnAsyncMock);
  });

  it("should be defined", () => {
    expect(codeMaat).toBeDefined();
  });

  it("should spawn a process with the correct arguments", async () => {
    spawnAsyncMock.mockResolvedValue(new CLIResult(0, "key1,key2\nvalue1,value2\n", ""));
    const args = ["-a", "analysis_type", "-c", "git2", "--log", "path/to/log"];

    await codeMaat.execute(args);

    const expectedArgs = ["-jar", expectedJarPath, ...args];
    expect(spawnAsyncMock).toHaveBeenCalledWith("java", expectedArgs);
  });

  it("should return an error if the command fails", async () => {
    spawnAsyncMock.mockResolvedValue(new CLIResult(1, "", "error", new Error("error message")));
    const args = ["-a", "analysis_type", "-c", "git2", "--log", "path/to/log"];

    const result = await codeMaat.execute(args);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe("error message");
  });

  it("should return success when file is processed", async () => {
    spawnAsyncMock.mockResolvedValue(new CLIResult(0, "key1,key2\nvalue1,value2\n", ""));

    const args = ["-a", "analysis_type", "-c", "git2", "--log", "path/to/log"];

    const result = await codeMaat.execute(args);

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().stdout).toBe("key1,key2\nvalue1,value2\n");
  });
});
