import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { CLIResult, spawnAsync } from "#lib/processes/index.ts";

class CustomChildProcessFake extends EventEmitter {
  stdout: EventEmitter = new EventEmitter();
  stderr: EventEmitter = new EventEmitter();
}

describe("spawAsync", () => {
  let mockChildProcess: CustomChildProcessFake;
  // biome-ignore lint/suspicious/noExplicitAny: mock type not expressible with bun:test mock API
  let spawnMock: any;
  let SUT: ReturnType<typeof spawnAsync>;

  beforeEach(() => {
    mock.clearAllMocks();
    mockChildProcess = new CustomChildProcessFake();
    spawnMock = mock<typeof spawn>();
    // biome-ignore lint/suspicious/noExplicitAny: mock return type mismatch — ChildProcess vs fake
    spawnMock.mockReturnValue(mockChildProcess as any);
    SUT = spawnAsync({ spawn: spawnMock });
  });

  it("should call spawn with the correct arguments", async () => {
    const command = "echo";
    const args = ["hello"];
    const options = { cwd: "/tmp" };

    const resultPromise = SUT(command, args, options);

    process.nextTick(() => {
      mockChildProcess.emit("close", 0);
    });

    await resultPromise;

    expect(spawnMock).toHaveBeenCalledWith(command, args, options);
  });

  it("should resolve successfully with stdout data", async () => {
    const command = "echo";
    const args = ["hello"];

    const resultPromise = SUT(command, args);

    process.nextTick(() => {
      mockChildProcess.stdout?.emit("data", "hello");
      mockChildProcess.stdout?.emit("data", " world\n");
      mockChildProcess.emit("close", 0);
    });

    const actualResult = await resultPromise;

    const expectedResult = new CLIResult(0, "hello world\n", "", null);
    expect(actualResult).toEqual(expectedResult);
  });

  it("should resolve failure with stderr", async () => {
    const resultPromise = SUT("false", []);

    process.nextTick(() => {
      mockChildProcess.stderr?.emit("data", "command failed");
      mockChildProcess.emit("close", 1);
    });

    const actualResult = await resultPromise;

    const expectedResult = new CLIResult(1, "", "command failed", null);
    expect(actualResult).toEqual(expectedResult);
  });

  it("should resolve failure when killed by signal (null exit code)", async () => {
    const resultPromise = SUT("sleep", ["10"]);

    process.nextTick(() => {
      mockChildProcess.emit("close", null, "SIGTERM" as NodeJS.Signals);
    });

    const actualResult = await resultPromise;

    const expectedResult = new CLIResult("SIGTERM", "", "", null);
    expect(actualResult).toEqual(expectedResult);
  });

  it("should resolve failure with Error when process fails to spawn", async () => {
    const resultPromise = SUT("non-existent-command", []);

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
