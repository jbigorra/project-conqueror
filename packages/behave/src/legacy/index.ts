import { AnalysisOptions, Behave } from "#behave/behave.ts";
import { AnalysisRunner } from "#runners/analysis_runner.ts";

export default class BehaveInstance {
  private static instance: Behave | null = null;

  static create(): Behave {
    BehaveInstance.instance ??= new Behave(AnalysisRunner.create({}));

    return BehaveInstance.instance;
  }
}

export { AnalysisOptions, Behave };
