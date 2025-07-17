import { ICLIExecutor, TCLIExecutorArgs, TCLIResult } from "../interfaces";

export class CodeMaat implements ICLIExecutor {
  constructor() {}

  async execute(args: TCLIExecutorArgs): Promise<TCLIResult> {
    throw new Error("Not implemented");
  }
}
