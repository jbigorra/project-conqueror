import path from "node:path";
import { Result } from "@prj-conq/lib/patterns";
import type { TCLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";
import type { ICLIExecutor } from "#lizard/ts-lizard/infrastructure/interfaces.ts";

function findPythonLizardDir(): string {
  // Resolve the lizard-ts package root via its package.json, then navigate
  // to the python-lizard directory. This works regardless of whether the
  // code is bundled into another package (e.g. behave via noExternal).
  const pkgJsonPath = import.meta.resolve("@prj-conq/lizard-ts/package.json");
  const pkgRoot = path.dirname(pkgJsonPath.replace("file://", ""));
  const candidates = [
    path.resolve(pkgRoot, "dist/python-lizard"),
    path.resolve(pkgRoot, "src/python-lizard"),
  ];
  for (const dir of candidates) {
    if (Bun.file(path.join(dir, "lizard.py")).size > 0) return dir;
  }
  throw new Error(`python-lizard directory not found. Searched: ${candidates.join(", ")}`);
}

/**
 * Executes the vendored Python lizard tool as a subprocess.
 *
 * Resolves the python-lizard directory at construction time by walking from the
 * package's `package.json` location, searching `dist/python-lizard` then `src/python-lizard`.
 *
 * @example
 * ```ts
 * const executor = new LizardExecutor(spawnAsync({ spawn }));
 * const result = await executor.execute(["src/index.ts", "--csv"]);
 * ```
 */
export class LizardExecutor implements ICLIExecutor {
  private readonly pathToLizard: string;
  private readonly pythonBin: string;

  /**
   * @param spawnAsync - Async spawn function for creating subprocesses
   * @param lizardPath - Override path to lizard.py (defaults to vendored copy)
   * @param pythonBin - Override path to Python binary (defaults to vendored .venv)
   */
  constructor(
    private readonly spawnAsync: TSpawnAsyncFn,
    lizardPath?: string,
    pythonBin?: string,
  ) {
    const pythonLizardDir = findPythonLizardDir();
    this.pathToLizard = lizardPath ?? path.resolve(pythonLizardDir, "lizard.py");
    this.pythonBin = pythonBin ?? path.resolve(pythonLizardDir, ".venv/bin/python");
  }

  /**
   * Runs the Python lizard tool with the given arguments.
   *
   * @param args - CLI arguments forwarded to lizard.py (e.g. `["src/", "--csv"]`)
   * @returns A Result wrapping the CLI output on success, or an Error on failure
   */
  async execute(args: string[]): Promise<Result<TCLIResult>> {
    try {
      const spawnArgs = [this.pathToLizard, ...args];
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
