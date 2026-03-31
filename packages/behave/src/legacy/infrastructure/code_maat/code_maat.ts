import path from "node:path";
import { Result } from "@prj-conq/lib/patterns";
import type { TCLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";
import type { ICLIExecutor } from "#infra/interfaces.ts";

export class CodeMaat implements ICLIExecutor {
  private readonly pathToJar: string = path.resolve(
    __dirname,
    "./vendor/code-maat-1.0.4-standalone.jar",
  );

  constructor(private readonly spawnAsync: TSpawnAsyncFn) {}

  async execute(args: string[]): Promise<Result<TCLIResult>> {
    const spawnArgs = ["-jar", this.pathToJar, ...args];

    const result = await this.spawnAsync("java", spawnArgs);

    if (result.isFailure()) {
      return Result.error(new Error(result.errorMessage()));
    }

    return Result.success(result);
  }
}
