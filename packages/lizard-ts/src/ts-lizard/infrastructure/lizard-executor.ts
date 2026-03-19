import path from "node:path";
import { Result } from "@prj-conq/lib/patterns";
import type { TCLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";
import type { ICLIExecutor } from "#lizard/ts-lizard/infrastructure/interfaces.ts";

export class LizardExecutor implements ICLIExecutor {
  private readonly pathToLizard: string;
  private readonly pythonBin: string;

  constructor(
    private readonly spawnAsync: TSpawnAsyncFn,
    lizardPath?: string,
    pythonBin?: string,
  ) {
    // Note: import.meta.dir resolves to the source directory when running
    // via Bun directly (dev/test). If consumed via the built dist/ output,
    // these defaults would resolve incorrectly. This is acceptable because
    // the package is private and always run from source within this monorepo.
    const pythonLizardDir = path.resolve(
      import.meta.dir,
      "../../python-lizard",
    );
    this.pathToLizard =
      lizardPath ?? path.resolve(pythonLizardDir, "lizard.py");
    this.pythonBin =
      pythonBin ?? path.resolve(pythonLizardDir, ".venv/bin/python");
  }

  async execute(args: string[]): Promise<Result<TCLIResult>> {
    try {
      const spawnArgs = [this.pathToLizard, ...args];
      const result = await this.spawnAsync(this.pythonBin, spawnArgs);

      if (result.isFailure()) {
        return Result.error(new Error(result.errorMessage()));
      }
      return Result.success(result);
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
