import { AnalysisOptions } from "../behave";

export interface IAnalysisRunner {
  run(options: AnalysisOptions): Promise<{ [key: string]: string }[]>;
}
