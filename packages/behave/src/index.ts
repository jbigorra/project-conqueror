import { Behave } from "./behave";
import { AnalysisRunner } from "./runners/analysis_runner";

export default class BehaveInstance {
  private static instance: Behave | null = null;

  static create() {
    if (!BehaveInstance.instance) {
      BehaveInstance.instance = new Behave(new AnalysisRunner());
    }

    return BehaveInstance.instance;
  }
}
