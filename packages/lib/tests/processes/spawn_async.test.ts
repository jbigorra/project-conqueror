import { CLIResult, spawnAsync } from "#lib/processes/index.js";
import { spawn } from "child_process";
import { EventEmitter } from "events";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("child_process");

class CustomChildProcessFake extends EventEmitter {
  stdout: EventEmitter = new EventEmitter();
  stderr: EventEmitter = new EventEmitter();
}

describe("spawAsync", () => {
  let mockChildProcess: CustomChildProcessFake;
  let spawnMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    spawnMock = vi.mocked(spawn);
    mockChildProcess = new CustomChildProcessFake();
    spawnMock.mockReturnValue(mockChildProcess as any);
  });

  it("should call spawn with the correct arguments", async () => {
    const command = "echo";
    const args = ["hello"];
    const options = { cwd: "/tmp" };

    const resultPromise = spawnAsync(command, args, options);

    process.nextTick(() => {
      mockChildProcess.emit("close", 0);
    });

    await resultPromise;

    expect(spawnMock).toHaveBeenCalledWith(command, args, options);
  });

  it("should resolve successfully with stdout data", async () => {
    const command = "echo";
    const args = ["hello"];

    const resultPromise = spawnAsync(command, args);

    process.nextTick(() => {
      mockChildProcess.stdout!.emit("data", "hello");
      mockChildProcess.stdout!.emit("data", " world\n");
      mockChildProcess.emit("close", 0);
    });

    const actualResult = await resultPromise;

    const expectedResult = new CLIResult(0, "hello world\n", "", null);
    expect(actualResult).toEqual(expectedResult);
  });

  it("should resolve failure with stderr", async () => {
    const resultPromise = spawnAsync("false");

    process.nextTick(() => {
      mockChildProcess.stderr!.emit("data", "command failed");
      mockChildProcess.emit("close", 1);
    });

    const actualResult = await resultPromise;

    const expectedResult = new CLIResult(1, "", "command failed", null);
    expect(actualResult).toEqual(expectedResult);
  });

  it("should resolve failure when killed by signal (null exit code)", async () => {
    const resultPromise = spawnAsync("sleep", ["10"]);

    process.nextTick(() => {
      mockChildProcess.emit("close", null, "SIGTERM" as NodeJS.Signals);
    });

    const actualResult = await resultPromise;

    const expectedResult = new CLIResult("SIGTERM", "", "", null);
    expect(actualResult).toEqual(expectedResult);
  });

  it("should resolve failure with Error when process fails to spawn", async () => {
    const resultPromise = spawnAsync("non-existent-command");

    const testError = new Error("ENOENT: no such file or directory");
    process.nextTick(() => {
      mockChildProcess.emit("error", testError);
      mockChildProcess.emit("close", 127);
    });

    const actualResult = await resultPromise;

    const expectedResult = new CLIResult(127, "", "", testError);
    expect(actualResult).toEqual(expectedResult);
  });
});
