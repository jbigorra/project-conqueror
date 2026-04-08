import type { SpawnOptionsWithoutStdio, spawn } from "node:child_process";
import type { TCLIResult } from "./cli-result";
import { CLIResult } from "./cli-result";

/** @internal Dependencies injected into spawnAsync for testability */
type TDeps = { spawn: typeof spawn };

/**
 * Signature of the async function returned by {@link spawnAsync}.
 *
 * @param command - The command to execute (e.g. "git", "java")
 * @param args - Arguments to pass to the command
 * @param options - Node.js spawn options (cwd, env, etc.)
 * @returns A Promise resolving to the structured CLI result
 *
 * @example
 * ```ts
 * import type { TSpawnAsyncFn } from "@prj-conq/lib/processes";
 *
 * async function run(exec: TSpawnAsyncFn) {
 *   const result = await exec("git", ["log", "--oneline"]);
 *   if (result.isSuccess()) console.log(result.stdout);
 * }
 * ```
 */
export type TSpawnAsyncFn = (
  command: string,
  args: readonly string[],
  options?: SpawnOptionsWithoutStdio,
) => Promise<TCLIResult>;

/**
 * Factory that creates an async subprocess executor with dependency-injected spawn.
 *
 * @param dependencies - Object containing the Node.js `spawn` function
 * @returns An async function that spawns a subprocess and returns a structured {@link TCLIResult}
 *
 * @example
 * ```ts
 * import { spawn } from "node:child_process";
 * import { spawnAsync } from "@prj-conq/lib/processes";
 *
 * const exec = spawnAsync({ spawn });
 * const result = await exec("git", ["status"], { cwd: "/repo" });
 *
 * if (result.isFailure()) {
 *   console.error(result.errorMessage());
 * }
 * ```
 */
export const spawnAsync = (dependencies: TDeps): TSpawnAsyncFn => {
  return (command, args = [], options) => {
    return new Promise((resolve) => {
      const child = dependencies.spawn(command, args, options);
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
  };
};
