import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { CLIResult } from "./cli_result.js";
import { TCLIResult } from "./types.js";

export type TSpawnAsyncFn = (
  command: string,
  args: string[],
  options?: SpawnOptionsWithoutStdio
) => Promise<TCLIResult>;

export function spawnAsync(
  command: string,
  args: string[] = [],
  options: SpawnOptionsWithoutStdio = {},
): Promise<TCLIResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);
    let stdout = "";
    let stderr = "";
    let err: Error | null = null;

    child.stdout?.on("data", (data) => {
      stdout += data;
    });
    child.stderr?.on("data", (data) => {
      stderr += data;
    });
    child.on("error", (error) => {
      err = error;
    });
    child.on("close", (exitCode: number | null, signal: NodeJS.Signals | null) => {
      /**
       * If the process exited, code is the final exit code of the process, otherwise null.
       * If the process terminated due to receipt of a signal, signal is the string name of the signal, otherwise null.
       * One of the two will always be non-null.
       * Ref: https://nodejs.org/docs/v22.17.1/api/child_process.html#event-close
       */
      // @ts-expect-error - exitCode and signal are mutually exclusive. Ref: https://nodejs.org/docs/v22.17.1/api/child_process.html#event-close
      resolve(new CLIResult(exitCode ?? signal, stdout, stderr, err));
    });
  });
}
