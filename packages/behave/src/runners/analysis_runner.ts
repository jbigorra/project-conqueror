import { Result } from "@project-conqueror/lib/patterns";
import { AnalysisOptions } from "../behave";
import { CodeMaat } from "../dependencies/code_maat/code_maat";
import { CSVParser } from "../dependencies/csv_parser/csv_parser";
import { ICLIExecutor, ICSVParser } from "../dependencies/interfaces";

export type TAnalysisResult = Record<string, string>[];

export interface IAnalysisRunner {
  run(options: AnalysisOptions): Promise<Result<TAnalysisResult>>;
}

export class AnalysisRunner implements IAnalysisRunner {
  constructor(
    private readonly cliExecutor: ICLIExecutor,
    private readonly csvParser: ICSVParser
  ) {}

  static create(dependencies: {
    cliExecutor?: ICLIExecutor;
    csvParser?: ICSVParser;
  }): IAnalysisRunner {
    const { cliExecutor = new CodeMaat(), csvParser = new CSVParser() } =
      dependencies;

    return new AnalysisRunner(cliExecutor, csvParser);
  }

  async run(options: AnalysisOptions): Promise<Result<TAnalysisResult>> {
    const cliResult = await this.cliExecutor.execute(options.toArgs());

    if (cliResult.isError()) {
      return Result.error(cliResult.getError());
    }

    const csvResult = await this.csvParser.parse(cliResult.getValue().stdout);

    return csvResult;
  }
}
