import { TAnalysisType } from "./analyses/types";
import { IAnalysisRunner, TAnalysisResult } from "./runners/analysis_runner";

/**
 * The date string is in the format of "YYYY-MM-DD"
 */
type TDateString = string;

/**
 * Absolute path to the log file.
 */
type TLogFilePath = string;

/**
 * Absolute path to the layers file.
 */
type TLayersFilePath = string;

/**
 * The input encoding of the log file. Specify an encoding other than UTF-8 for the log file.
 */
type TInputEncoding = "utf-8" | string;

/**
 * A regex to match against commit messages. Used with -messages analyses.
 */
type TRegexExpressionToMatch = string;

/**
 * Options for the analysis.
 */
export type TOptions = {
  analysis_type: TAnalysisType;
  log_file: TLogFilePath;
  rows?: string;
  min_revs?: string;
  min_shared_revs?: string;
  min_coupling?: string;
  max_coupling?: string;
  max_changeset_size?: string;
  expression_to_match?: TRegexExpressionToMatch;
  temporal_period?: string;
  age_time_now?: TDateString;
  input_encoding?: TInputEncoding;
  group?: TLayersFilePath;
  team_map_file?: TLayersFilePath;
  verbose_results?: boolean;
};

/**
 * All the options for the analysis must be set as a string.
 */
export class AnalysisOptions {
  /**
   * The type of analysis to run.
   */
  readonly analysis_type: TAnalysisType;
  /**
   * The absolute path to the log file.
   */
  readonly log_file: TLogFilePath;
  /**
   * The number of rows to return.
   */
  readonly rows?: string;
  /**
   * The minimum number of revisions per entity to consider.
   */
  readonly min_revs?: string;
  /**
   * The minimum number of shared revisions per entity to consider.
   */
  readonly min_shared_revs?: string;
  /**
   * The minimum coupling between two entities to consider (percentage).
   */
  readonly min_coupling?: string;
  /**
   * The maximum coupling between two entities to consider (percentage).
   */
  readonly max_coupling?: string;
  /**
   * Maximum number of modules in a change set if it shall be included in a coupling analysis.
   */
  readonly max_changeset_size?: string;
  /**
   * A regex to match against commit messages. Used with -messages analyses.
   */
  readonly expression_to_match?: TRegexExpressionToMatch;
  /**
   * Considers all commits during the rolling temporal period as a single, logical commit set in number of days. Used with -coupling analyses.
   */
  readonly temporal_period?: string;
  /**
   * Specify a date as YYYY-MM-dd that counts as time zero when doing a code age analysis.
   */
  readonly age_time_now?: TDateString;
  /**
   * The input encoding of the log file.
   */
  readonly input_encoding?: TInputEncoding;
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
  readonly group?: TLayersFilePath;

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
  readonly team_map_file?: TLayersFilePath;

  /**
   * Includes additional analysis details together with the results. Only implemented for change coupling.
   */
  readonly verbose_results: string;

  constructor(options: TOptions) {
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
    this.verbose_results = options.verbose_results ? "--verbose-results" : "";
  }

  to_args(): {
    requiredArgs: string[];
    optionalArgs: string[];
    optionalBooleanArgs: string[];
  } {
    const requiredArgs = [
      "--log",
      this.log_file,
      "--analysis",
      this.analysis_type,
    ];
    const optionalArgs: string[] = [];
    const optionalBooleanArgs: string[] = [];
    const addIfDefined = (value: any, arg: string) => {
      if (value !== undefined) {
        optionalArgs.push(arg, value.toString());
      }
    };

    addIfDefined(this.temporal_period, "--temporal-period");
    addIfDefined(this.rows, "--rows");
    addIfDefined(this.min_revs, "--min-revs");
    addIfDefined(this.min_shared_revs, "--min-shared-revs");
    addIfDefined(this.min_coupling, "--min-coupling");
    addIfDefined(this.max_coupling, "--max-coupling");
    addIfDefined(this.max_changeset_size, "--max-changeset-size");
    addIfDefined(this.expression_to_match, "--expression-to-match");
    addIfDefined(this.input_encoding, "--input-encoding");
    addIfDefined(this.group, "--group");
    addIfDefined(this.team_map_file, "--team-map-file");

    if (this.verbose_results) optionalBooleanArgs.push("--verbose-results");

    return {
      requiredArgs,
      optionalArgs,
      optionalBooleanArgs,
    };
  }

  private _validate(options: TOptions): void {
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

/**
 * The main class for running the analysis.
 *
 * @param analysis - The analysis runner to use.
 *
 * @example
 * ```ts
 * const behave = new Behave(new AnalysisRunner());
 * const result = await behave.run_analysis(new AnalysisOptions({
 *   analysis_type: "abs-churn",
 *   log_file: "my/absolute/path/to/git.log",
 * }));
 * ```
 */
export class Behave {
  constructor(private readonly analysis: IAnalysisRunner) {}

  /**
   * Runs the selected analysis.
   *
   * @param options - The options for the analysis.
   * @returns The analysis result.
   */
  async run_analysis(
    options: AnalysisOptions
  ): Promise<TAnalysisResult | Error> {
    const result = await this.analysis.run(options);

    if (result.isError()) {
      return result.getError();
    }

    return result.getValue();
  }
}
