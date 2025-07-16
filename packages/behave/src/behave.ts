import { AnalysisType } from "./analyses/types";
import { AnalysisResult, IAnalysisRunner } from "./runners/analysis_runner";

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
  team_map_file?: LayersFilePath;
  verbose_results?: boolean;
};

export class AnalysisOptions {
  /**
   * The type of analysis to run.
   */
  readonly analysis_type: AnalysisType;
  /**
   * The absolute path to the log file.
   */
  readonly log_file: LogFilePath;
  /**
   * The number of rows to return.
   */
  readonly rows?: number;
  /**
   * The minimum number of revisions per entity to consider.
   */
  readonly min_revs?: number;
  /**
   * The minimum number of shared revisions per entity to consider.
   */
  readonly min_shared_revs?: number;
  /**
   * The minimum coupling between two entities to consider (percentage).
   */
  readonly min_coupling?: number;
  /**
   * The maximum coupling between two entities to consider (percentage).
   */
  readonly max_coupling?: number;
  /**
   * Maximum number of modules in a change set if it shall be included in a coupling analysis.
   */
  readonly max_changeset_size?: number;
  /**
   * A regex to match against commit messages. Used with -messages analyses.
   */
  readonly expression_to_match?: RegexExpressionToMatch;
  /**
   * Considers all commits during the rolling temporal period as a single, logical commit set in number of days. Used with -coupling analyses.
   */
  readonly temporal_period?: number;
  /**
   * Specify a date as YYYY-MM-dd that counts as time zero when doing a code age analysis.
   */
  readonly age_time_now?: DateString;
  /**
   * The input encoding of the log file.
   */
  readonly input_encoding?: InputEncoding;
  /**
   * A file with a pre-defined set of layers. The data will be aggregated according to the group of layers.
   * Example: layers.txt
   *
   * ```
   *   UI Layer => src/main/webapp/.*
   *   Business Layer => src/main/java/com/company/business/.*
   *   Data Layer => src/main/java/com/company/data/.*
   * ```
   */
  readonly group?: LayersFilePath;

  /**
   * A CSV file with author,team that translates individuals into teams.
   * Example: team_map.csv
   *
   * ```csv
   *   author,team
   *   John Doe,Team A
   *   Jane Smith,Team B
   *   Jim Beam,Team A
   * ```
   */
  readonly team_map_file?: LayersFilePath;

  /**
   * Includes additional analysis details together with the results. Only implemented for change coupling.
   */
  readonly verbose_results: boolean;

  constructor(options: Options) {
    this._validate(options);
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
    this.team_map_file = options.team_map_file;
    this.verbose_results = options.verbose_results ?? false;
  }

  private _validate(options: Options): void {
    if (!options.analysis_type) {
      throw new Error("analysis_type is required");
    }
    if (!options.log_file) {
      throw new Error("log_file is required");
    }
    if (options.analysis_type === "age" && !options.age_time_now) {
      throw new Error("age_time_now is required when analysis_type is 'age'");
    }
    if (options.analysis_type === "message") {
      throw new Error("analysis_type 'message' is not yet supported");
    }
  }
}

export class Behave {
  constructor(private readonly analysis: IAnalysisRunner) {}

  async run_analysis(options: AnalysisOptions): Promise<AnalysisResult> {
    return await this.analysis.run(options);
  }
}
