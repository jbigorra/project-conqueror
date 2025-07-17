import { Behave } from "./behave";
import { CodeMaat } from "./dependencies/code_maat/code_maat";
import { AnalysisRunner } from "./runners/analysis_runner";

export default class BehaveInstance {
  private static instance: Behave | null = null;

  static create() {
    if (!BehaveInstance.instance) {
      BehaveInstance.instance = new Behave(new AnalysisRunner(new CodeMaat()));
    }

    return BehaveInstance.instance;
  }
}
