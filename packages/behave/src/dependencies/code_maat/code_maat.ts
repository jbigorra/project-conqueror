import { CLIExecutorArgs, CLIResult, ICLIExecutor } from "../interfaces";

export class CodeMaat implements ICLIExecutor {
  constructor() {}

  async execute(args: CLIExecutorArgs): Promise<CLIResult> {
    throw new Error("Not implemented");
  }
}
