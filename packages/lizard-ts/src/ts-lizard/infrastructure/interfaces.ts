import type { Result } from "@prj-conq/lib/patterns";
import type { TCLIResult } from "@prj-conq/lib/processes";

/** Contract for executing a CLI tool as a subprocess and returning its output. */
export interface ICLIExecutor {
  /**
   * Executes the CLI tool with the given arguments.
   *
   * @param args - Command-line arguments to pass to the tool
   * @returns A Result wrapping the CLI output on success or an Error on failure
   */
  execute(args: string[]): Promise<Result<TCLIResult>>;
}
