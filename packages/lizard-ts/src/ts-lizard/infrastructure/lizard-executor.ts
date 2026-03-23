import { existsSync } from "node:fs";
import path from "node:path";
import { Result } from "@prj-conq/lib/patterns";
import type { TCLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";
import type { ICLIExecutor } from "#lizard/ts-lizard/infrastructure/interfaces.ts";

function findPythonLizardDir(): string {
  // From dist/index.js: python-lizard/ is copied adjacent by bunup
  // From source: python-lizard/ is at ../../python-lizard relative to this file
  const candidates = [
    path.resolve(import.meta.dir, "python-lizard"),
    path.resolve(import.meta.dir, "../../python-lizard"),
  ];
  for (const dir of candidates) {
    if (existsSync(path.join(dir, "lizard.py"))) return dir;
  }
  throw new Error(
    `python-lizard directory not found. Searched: ${candidates.join(", ")}`,
  );
}

export class LizardExecutor implements ICLIExecutor {
  private readonly pathToLizard: string;
  private readonly pythonBin: string;

  constructor(
    private readonly spawnAsync: TSpawnAsyncFn,
    lizardPath?: string,
    pythonBin?: string,
  ) {
    const pythonLizardDir = findPythonLizardDir();
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
