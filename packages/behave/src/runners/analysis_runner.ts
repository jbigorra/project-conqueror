import { AnalysisOptions } from "../behave";
import { ICLIExecutor } from "../dependencies/interfaces";

export type AnalysisResult = {
  data: { [key: string]: string }[] | undefined;
  error: Error | undefined;
};

export interface IAnalysisRunner {
  run(options: AnalysisOptions): Promise<AnalysisResult>;
}

export class AnalysisRunner implements IAnalysisRunner {
  constructor(private readonly cli_executor: ICLIExecutor) {}

  async run(options: AnalysisOptions): Promise<AnalysisResult> {
    const result = await this.cli_executor.execute(options.to_args());

    return {
      data: undefined,
      error: undefined,
    };
  }
}
