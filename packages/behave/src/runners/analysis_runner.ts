import { AnalysisOptions } from "#behave/behave.js";
import { CodeMaat } from "#infra/code_maat/code_maat.js";
import { CSVParser } from "#infra/csv_parser/csv_parser.js";
import { ICLIExecutor, ICSVParser } from "#infra/interfaces.js";
import { Result } from "@prj-conq/lib/patterns";
import { spawnAsync } from "@prj-conq/lib/processes";

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
    const { cliExecutor = new CodeMaat(spawnAsync), csvParser = new CSVParser() } =
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
