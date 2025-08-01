import { TAnalysisType } from "#analyses/types.js";
import { IAnalysisRunner, TAnalysisResult } from "#runners/analysis_runner.js";

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
  analysisType: TAnalysisType;
  logFile: TLogFilePath;
  rows?: string;
  minRevs?: string;
  minSharedRevs?: string;
  minCoupling?: string;
  maxCoupling?: string;
  maxChangesetSize?: string;
  expressionToMatch?: TRegexExpressionToMatch;
  temporalPeriod?: string;
  ageTimeNow?: TDateString;
  inputEncoding?: TInputEncoding;
  group?: TLayersFilePath;
  teamMapFile?: TLayersFilePath;
  verboseResults?: boolean;
};

/**
 * All the options for the analysis must be set as a string.
 */
export class AnalysisOptions {
  /**
   * The type of analysis to run.
   */
  readonly analysisType: TAnalysisType;
  /**
   * The absolute path to the log file.
   */
  readonly logFile: TLogFilePath;
  /**
   * The number of rows to return.
   */
  readonly rows?: string;
  /**
   * The minimum number of revisions per entity to consider.
   */
  readonly minRevs?: string;
  /**
   * The minimum number of shared revisions per entity to consider.
   */
  readonly minSharedRevs?: string;
  /**
   * The minimum coupling between two entities to consider (percentage).
   */
  readonly minCoupling?: string;
  /**
   * The maximum coupling between two entities to consider (percentage).
   */
  readonly maxCoupling?: string;
  /**
   * Maximum number of modules in a change set if it shall be included in a coupling analysis.
   */
  readonly maxChangesetSize?: string;
  /**
   * A regex to match against commit messages. Used with -messages analyses.
   */
  readonly expressionToMatch?: TRegexExpressionToMatch;
  /**
   * Considers all commits during the rolling temporal period as a single, logical commit set in number of days. Used with -coupling analyses.
   */
  readonly temporalPeriod?: string;
  /**
   * Specify a date as YYYY-MM-dd that counts as time zero when doing a code age analysis.
   */
  readonly ageTimeNow?: TDateString;
  /**
   * The input encoding of the log file.
   */
  readonly inputEncoding?: TInputEncoding;
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
  readonly teamMapFile?: TLayersFilePath;

  /**
   * Includes additional analysis details together with the results. Only implemented for change coupling.
   */
  readonly verboseResults: string;

  constructor(options: TOptions) {
    this._validate(options);
    this.analysisType = options.analysisType;
    this.logFile = options.logFile;
    this.rows = options.rows;
    this.minRevs = options.minRevs;
    this.minSharedRevs = options.minSharedRevs;
    this.minCoupling = options.minCoupling;
    this.maxCoupling = options.maxCoupling;
    this.maxChangesetSize = options.maxChangesetSize;
    this.expressionToMatch = options.expressionToMatch;
    this.temporalPeriod = options.temporalPeriod;
    this.ageTimeNow = options.ageTimeNow;
    this.inputEncoding = options.inputEncoding;
    this.group = options.group;
    this.teamMapFile = options.teamMapFile;
    this.verboseResults = options.verboseResults ? "--verbose-results" : "";
  }

  toArgs(): string[] {
    const requiredArgs = [
      "--log",
      this.logFile,
      "--analysis",
      this.analysisType,
      "--version-control",
      "git2",
    ];
    const optionalArgs: string[] = [];
    const optionalBooleanArgs: string[] = [];
    const addIfDefined = (value: any, arg: string) => {
      if (value !== undefined) {
        optionalArgs.push(arg, value.toString());
      }
    };

    addIfDefined(this.temporalPeriod, "--temporal-period");
    addIfDefined(this.rows, "--rows");
    addIfDefined(this.minRevs, "--min-revs");
    addIfDefined(this.minSharedRevs, "--min-shared-revs");
    addIfDefined(this.minCoupling, "--min-coupling");
    addIfDefined(this.maxCoupling, "--max-coupling");
    addIfDefined(this.maxChangesetSize, "--max-changeset-size");
    addIfDefined(this.expressionToMatch, "--expression-to-match");
    addIfDefined(this.inputEncoding, "--input-encoding");
    addIfDefined(this.group, "--group");
    addIfDefined(this.teamMapFile, "--team-map-file");

    if (this.verboseResults) optionalBooleanArgs.push("--verbose-results");

    return [...requiredArgs, ...optionalArgs, ...optionalBooleanArgs];
  }

  private _validate(options: TOptions): void {
    if (!options.analysisType) {
      throw new Error("analysisType is required");
    }
    if (!options.logFile) {
      throw new Error("logFile is required");
    }
    if (options.analysisType === "age" && !options.ageTimeNow) {
      throw new Error("ageTimeNow is required when analysisType is 'age'");
    }
    if (options.analysisType === "message") {
      throw new Error("analysisType 'message' is not yet supported");
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
 * const result = await behave.runAnalysis(new AnalysisOptions({
 *   analysisType: "abs-churn",
 *   logFile: "my/absolute/path/to/git.log",
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
  async runAnalysis(
    options: AnalysisOptions
  ): Promise<TAnalysisResult | Error> {
    const result = await this.analysis.run(options);

    if (result.isError()) {
      return result.getError();
    }

    return result.getValue();
  }
}
