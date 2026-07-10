import type { AnalysisOptions } from "@prj-conq/code-maat-ts";

/** Output format for analysis results. */
export type OutputFormat = "json" | "csv";

/** Shared base fields for all analysis inputs. */
export type BaseAnalysisInput = {
  /** Output format; defaults to "json" when omitted. */
  format?: OutputFormat;
};

/**
 * Input for a single code-maat analysis.
 *
 * @example
 * ```ts
 * const input: SimpleAnalysisInput = {
 *   gitLogPath: "/tmp/project.log",
 *   options: { minRevs: 3 },
 * };
 * ```
 */
export type SimpleAnalysisInput = BaseAnalysisInput & {
  /** Absolute path to the git log file. */
  gitLogPath: string;
  /** Version control type; defaults to "git". */
  vcsType?: string;
  /** Override default code-maat thresholds (minRevs, minCoupling, etc.). */
  options?: Partial<AnalysisOptions>;
  /** Reference date for age analysis in "YYYY-MM-DD" format. Required for age analysis. */
  ageTimeNow?: string;
  /** Regex to match against commit messages. Required for messages analysis. */
  expressionToMatch?: string;
  /** Path to a layers file for grouping entities. */
  group?: string;
  /** Path to a CSV mapping authors to teams. */
  teamMapFile?: string;
  /** Rolling temporal period in days for coupling analysis. */
  temporalPeriod?: string;
};

/**
 * Input for the complexity-hotspots aggregated analysis.
 *
 * @example
 * ```ts
 * const input: ComplexityHotspotsInput = {
 *   gitLogPath: "/tmp/project.log",
 *   sourceDir: "/home/user/project/src",
 * };
 * ```
 */
export type ComplexityHotspotsInput = BaseAnalysisInput & {
  /** Absolute path to the git log file. */
  gitLogPath: string;
  /** Absolute path to the source directory for lizard complexity analysis. */
  sourceDir: string;
  /** Version control type; defaults to "git". */
  vcsType?: string;
  /** Override default code-maat thresholds (minRevs, minCoupling, etc.). */
  options?: Partial<AnalysisOptions>;
};
