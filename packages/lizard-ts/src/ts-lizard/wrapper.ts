import type { ICLIExecutor } from "#lizard/ts-lizard/infrastructure/interfaces.ts";

/**
 * High-level wrapper for cyclomatic complexity analysis via Python lizard.
 *
 * Delegates execution to an {@link ICLIExecutor} and prepends CSV column headers
 * to the raw lizard output so the result is a complete, parseable CSV string.
 *
 * @example
 * ```ts
 * const lizard = LizardInstance.create();
 * const csv = await lizard.analyze("src/");
 * if (csv instanceof Error) throw csv;
 * console.log(csv); // CSV with headers + function-level metrics
 * ```
 */
export class Lizard {
  /** CSV column headers prepended to lizard's raw output. */
  readonly CSV_HEADERS =
    "nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line\n";

  /**
   * @param executor - CLI executor that spawns the Python lizard subprocess
   */
  constructor(private readonly executor: ICLIExecutor) {}

  /**
   * Runs cyclomatic complexity analysis on the given source path.
   *
   * @param sourcePath - File or directory to analyze
   * @returns CSV string with headers on success, or an Error on failure
   *
   * @example
   * ```ts
   * const result = await lizard.analyze("src/feature/");
   * if (result instanceof Error) { console.error(result.message); }
   * ```
   */
  async analyze(sourcePath: string): Promise<string | Error> {
    const result = await this.executor.execute([sourcePath, "--csv"]);

    if (result.isError()) {
      return result.getError();
    }

    return this.CSV_HEADERS + result.getValue().stdout;
  }
}
