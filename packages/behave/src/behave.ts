import { AnalysisType } from "./analyses/types";
import { IAnalysisRunner } from "./runners/analysis_runner";

/**
 * The date string is in the format of "YYYY-MM-DD"
 */
type DateString = string;
type LogFilePath = string;
type LayersFilePath = string;
type InputEncoding = "utf-8" | "utf-16";
type RegexExpressionToMatch = string;

type Options = {
  analysis_type: AnalysisType;
  log_file: LogFilePath;
  rows?: number;
  min_revs?: number;
  min_shared_revs?: number;
  min_coupling?: number;
  max_coupling?: number;
  max_changeset_size?: number;
  expression_to_match?: RegexExpressionToMatch;
  temporal_period?: number;
  age_time_now?: DateString;
  input_encoding?: InputEncoding;
  group?: LayersFilePath;
};

export class AnalysisOptions {
  readonly analysis_type: AnalysisType;
  readonly log_file: String;
  readonly rows?: number;
  readonly min_revs?: number;
  readonly min_shared_revs?: number;
  readonly min_coupling?: number;
  readonly max_coupling?: number;
  readonly max_changeset_size?: number;
  readonly expression_to_match?: RegexExpressionToMatch;
  readonly temporal_period?: number;
  readonly age_time_now?: DateString;
  readonly input_encoding?: InputEncoding;
  readonly group?: LayersFilePath;

  constructor(options: Options) {
    this.analysis_type = options.analysis_type;
    this.log_file = options.log_file;
    this.rows = options.rows;
    this.min_revs = options.min_revs;
    this.min_shared_revs = options.min_shared_revs;
    this.min_coupling = options.min_coupling;
    this.max_coupling = options.max_coupling;
    this.max_changeset_size = options.max_changeset_size;
    this.expression_to_match = options.expression_to_match;
    this.temporal_period = options.temporal_period;
    this.age_time_now = options.age_time_now;
    this.input_encoding = options.input_encoding;
    this.group = options.group;
  }
}

export class Behave {
  constructor(private readonly analysis: IAnalysisRunner) {}

  async run_analysis(
    options: AnalysisOptions
  ): Promise<{ [key: string]: string }[]> {
    return await this.analysis.run(options);
  }
}
