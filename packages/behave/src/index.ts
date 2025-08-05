import { Behave } from "#behave/behave.js";
import { AnalysisRunner } from "#runners/analysis_runner.js";

export default class BehaveInstance {
  private static instance: Behave | null = null;

  static create() {
    BehaveInstance.instance ??= new Behave(AnalysisRunner.create({}));

    return BehaveInstance.instance;
  }
}
