import { Behave } from "#behave/behave.js";
import { CodeMaat } from "#deps/code_maat/code_maat.js";
import { CSVParser } from "#deps/csv_parser/csv_parser.js";
import { AnalysisRunner } from "#runners/analysis_runner.js";

export default class BehaveInstance {
  private static instance: Behave | null = null;

  static create() {
    if (!BehaveInstance.instance) {
      BehaveInstance.instance = new Behave(
        new AnalysisRunner(new CodeMaat(), new CSVParser())
      );
    }

    return BehaveInstance.instance;
  }
}
