import path from "node:path";
import { Result } from "@prj-conq/lib/patterns";
import type { TCLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";
import type { ICLIExecutor } from "#lizard/ts-lizard/infrastructure/interfaces.ts";

function findVenvDir(): string {
  const pkgJsonPath = import.meta.resolve("@prj-conq/lizard-ts/package.json");
  const pkgRoot = path.dirname(pkgJsonPath.replace("file://", ""));
  return path.resolve(pkgRoot, ".venv");
}

/**
 * Executes the Python lizard tool (installed via pip) as a subprocess.
 *
 * Resolves the `.venv` at the package root by walking from `package.json`.
 *
 * @example
 * ```ts
 * const executor = new LizardExecutor(spawnAsync({ spawn }));
 * const result = await executor.execute(["src/index.ts", "--csv"]);
 * ```
 */
export class LizardExecutor implements ICLIExecutor {
  private readonly pythonBin: string;

  /**
   * @param spawnAsync - Async spawn function for creating subprocesses
   * @param pythonBin - Override path to Python binary (defaults to `.venv/bin/python`)
   */
  constructor(
    private readonly spawnAsync: TSpawnAsyncFn,
    pythonBin?: string,
  ) {
    this.pythonBin = pythonBin ?? path.resolve(findVenvDir(), "bin/python");
  }

  /**
   * Runs `python -m lizard` with the given arguments.
   *
   * @param args - CLI arguments forwarded to lizard (e.g. `["src/", "--csv"]`)
   * @returns A Result wrapping the CLI output on success, or an Error on failure
   */
  async execute(args: string[]): Promise<Result<TCLIResult>> {
    try {
      const spawnArgs = ["-m", "lizard", ...args];
      const result = await this.spawnAsync(this.pythonBin, spawnArgs);

      if (result.isFailure()) {
        return Result.error(new Error(result.errorMessage()));
      }
      return Result.success(result);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
