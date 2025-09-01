import { AnalysisOptions } from "#behave/behave.ts";
import { CodeMaat } from "#infra/code_maat/code_maat.ts";
import { CSVParser } from "#infra/csv_parser/csv_parser.ts";
import type { ICLIExecutor, ICSVParser } from "#infra/interfaces.ts";
import { Result } from "@prj-conq/lib/patterns";
import { spawnAsync } from "@prj-conq/lib/processes";
import { spawn } from "node:child_process";

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
