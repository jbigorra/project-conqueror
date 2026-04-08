import type { Undefinedable } from "#lib/generics/index.ts";

/**
 * Shape of a structured CLI subprocess result.
 *
 * @example
 * ```ts
 * import type { TCLIResult } from "@prj-conq/lib/processes";
 *
 * function handleOutput(result: TCLIResult) {
 *   if (result.isSuccess()) {
 *     console.log(result.stdout);
 *   }
 * }
 * ```
 */
export type TCLIResult = {
  /** Standard output captured from the subprocess */
  stdout: string;
  /** Standard error captured from the subprocess */
  stderr: string;
  /** Exit code (number) or termination signal (NodeJS.Signals) */
  errorCode: number | NodeJS.Signals;
  /** Subprocess spawn error, if one occurred */
  error: Error | null;
  /**
   * Returns a human-readable error message, cascading through error, stderr, stdout.
   *
   * @returns The error message string, or undefined if the command succeeded
   */
  errorMessage: () => Undefinedable<string>;
  /** @returns true if the process exited with code 0 */
  isSuccess: () => boolean;
  /** @returns true if the process did not exit with code 0 */
  isFailure: () => boolean;
};

/**
 * Value object wrapping structured output from a CLI subprocess.
 *
 * @example
 * ```ts
 * import { CLIResult } from "@prj-conq/lib/processes";
 *
 * const result = new CLIResult(0, "output", "");
 * result.isSuccess(); // true
 * result.errorMessage(); // undefined
 *
 * const failed = new CLIResult(1, "", "not found");
 * failed.isFailure(); // true
 * failed.errorMessage(); // "not found"
 * ```
 */
export class CLIResult implements TCLIResult {
  /**
   * @param errorCode - Exit code or termination signal from the subprocess
   * @param stdout - Captured standard output
   * @param stderr - Captured standard error
   * @param error - Spawn error, if one occurred
   * @throws {Error} If errorCode is null
   */
  constructor(
    public readonly errorCode: number | NodeJS.Signals,
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly error: Error | null = null,
  ) {
    if (errorCode === null) {
      throw new Error("errorCode is can't be null");
    }
  }

  /**
   * Returns a human-readable error message, cascading: error > stderr > stdout > generic.
   *
   * @returns The error message string, or undefined if the command succeeded
   */
  errorMessage(): Undefinedable<string> {
    if (this.isSuccess()) return undefined;
    if (this.error) return this.error.message;
    if (this.stderr.trim().length > 0) return this.stderr;
    if (this.stdout.trim().length > 0) return this.stdout;

    return `Command failed with errorCode ${this.errorCode}`;
  }

  /**
   * Checks whether the subprocess exited successfully.
   *
   * @returns true if errorCode is 0
   */
  isSuccess(): boolean {
    return this.errorCode === 0;
  }

  /**
   * Checks whether the subprocess failed.
   *
   * @returns true if errorCode is not 0
   */
  isFailure(): boolean {
    return !this.isSuccess();
  }
}
