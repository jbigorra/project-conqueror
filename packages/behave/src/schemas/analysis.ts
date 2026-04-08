import type { OutputFormat } from "../types";

/** Metadata attached to every analysis result. */
export type AnalysisMetadata = {
  /** Name of the analysis that produced this result (e.g. "revisions", "coupling"). */
  analysisName: string;
  /** When the analysis was executed. */
  timestamp: Date;
  /** Input parameters passed to the analysis (excludes format). */
  parameters: Record<string, unknown>;
  /** Output format used for the result data. */
  format: OutputFormat;
};

/**
 * Discriminated union for analysis results: JSON returns typed arrays, CSV returns a string.
 *
 * @example
 * ```ts
 * const result: Analysis<Revision> = await simple.revisions({ gitLogPath: "/tmp/project.log" });
 * if (result.metadata.format === "json") {
 *   console.log(result.data[0].nRevs); // typed access
 * }
 * ```
 */
export type Analysis<T> =
  | { metadata: AnalysisMetadata & { format: "json" }; data: readonly T[] }
  | { metadata: AnalysisMetadata & { format: "csv" }; data: string };
