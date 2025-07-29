import { ICLIExecutor } from "#deps/interfaces.js";
import { Result } from "@prj-conq/lib/patterns";
import { TCLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";

export class CodeMaat implements ICLIExecutor {
  constructor() {}

  async execute(args: string[]): Promise<Result<TCLIResult>> {
    throw new Error("Not implemented");
  }
}

export class JarExecutor implements ICLIExecutor {
  constructor(
    private readonly pathToJar: string,
    private readonly spawnAsync: TSpawnAsyncFn
  ) {}

  async execute(args: string[]): Promise<Result<TCLIResult>> {
    const spawnArgs = [
      "-jar",
      this.pathToJar,
      ...args,
    ];

    console.log(spawnArgs.join(" "));
    const result =await this.spawnAsync("java", spawnArgs);

    if (result.isFailure()) {
      return Result.error(new Error(result.errorMessage()));
    }

    return Result.success(result);
  }
}

