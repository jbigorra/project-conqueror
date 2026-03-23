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
