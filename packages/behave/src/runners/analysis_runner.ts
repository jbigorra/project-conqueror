import { AnalysisOptions } from "../behave";

export type AnalysisResult = {
  data: { [key: string]: string }[] | undefined;
  error: Error | undefined;
};

export interface IAnalysisRunner {
  run(options: AnalysisOptions): Promise<AnalysisResult>;
}

export class AnalysisRunner implements IAnalysisRunner {
  run(options: AnalysisOptions): Promise<AnalysisResult> {
    throw new Error("Not implemented");
  }
}
