import { ICLIExecutor } from "#deps/interfaces.js";
import { Result } from "@prj-conq/lib/patterns";
import { spawnAsync, TCLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";
import path from "node:path";

export class CodeMaat implements ICLIExecutor {
  private readonly pathToJar: string = path.resolve(__dirname, "./vendor/code-maat-1.0.4-standalone.jar");

  constructor(
    private readonly spawnAsync: TSpawnAsyncFn
  ) {}

  async execute(args: string[]): Promise<Result<TCLIResult>> {
    const spawnArgs = [
      "-jar",
      this.pathToJar,
      ...args,
    ];

    const result =await this.spawnAsync("java", spawnArgs);

    if (result.isFailure()) {
      return Result.error(new Error(result.errorMessage()));
    }

    return Result.success(result);
  }
}

(async () => {
  const executor = new CodeMaat(spawnAsync);

const result = await executor.execute([
    "--log",
    "/Users/jbigorra/Projects/project-conqueror/logfile.log",
    "--analysis",
    "abs-churn",
    "-c",
    "git2"
  ]);

  if (result.isError()) {
    console.log(result.getError());
  } else {
    console.log(result.getValue());
  }
})().catch(console.error);
