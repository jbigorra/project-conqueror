import { ICLIExecutor } from "#deps/interfaces.js";
import { Result } from "@prj-conq/lib/patterns";
import { TCLIResult, TSpawnAsyncFn } from "@prj-conq/lib/processes";

export class CodeMaat implements ICLIExecutor {
  private readonly pathToJar: string = "./vendor/code-maat-1.0.4-standalone.jar";

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

// (async () => {
//   const executor = new JarExecutor(
//   "/Users/jbigorra/Projects/project-conqueror/packages/behave/src/dependencies/code_maat/vendor/code-maat-1.0.4-standalone.jar",
//   spawnAsync
// );

// const result = await executor.execute({
//   requiredArgs: [
//     "--log",
//     "/Users/jbigorra/Projects/project-conqueror/logfile.log",
//     "--analysis",
//     "abs-churn",
//     "-c",
//     "git2"
//   ],
//   optionalArgs: [],
//   optionalBooleanArgs: [],
// });

//   console.log(result.getValue());
//   console.log(result.getError());
// })().catch(console.error);
