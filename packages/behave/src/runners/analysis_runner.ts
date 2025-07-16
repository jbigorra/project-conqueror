import { AnalysisOptions } from "../behave";

export type AnalysisResult = {
  data: { [key: string]: string }[] | undefined;
  error: Error | undefined;
};

export interface IAnalysisRunner {
  run(options: AnalysisOptions): Promise<AnalysisResult>;
}
