/**
 * Port of code_maat.app.app
 *
 * Top-level orchestration module that glues parsers, groupers, and analyses
 * into a pipeline. Currently supports the coupling analysis with optional
 * time-based grouping.
 */

import { parseLog as parseGitLog } from "../parsers/git";
import { byDegree } from "../analysis/logical-coupling";
import { byTimePeriod } from "./time-based-grouper";
import type { VCSEntry, AnalysisOptions } from "../types";

export type AppOptions = AnalysisOptions & {
  versionControl: string;
  analysis: string;
  temporalPeriod?: string;
};

type RawEntry = VCSEntry & { date: string };

async function parseCommits(
  logFilePath: string,
  options: AppOptions
): Promise<RawEntry[]> {
  const { versionControl } = options;
  switch (versionControl) {
    case "git":
      return (await parseGitLog(logFilePath, {})) as RawEntry[];
    default:
      throw new Error(
        `Invalid --version-control specified: ${versionControl}. Supported options are: git.`
      );
  }
}

function aggregateOnTemporalPeriod(
  commits: RawEntry[],
  options: AppOptions
): RawEntry[] {
  if (!options.temporalPeriod) return commits;
  // byTimePeriod validates and throws if the period is invalid
  return byTimePeriod(commits, { temporalPeriod: options.temporalPeriod }) as RawEntry[];
}

/**
 * Run an analysis pipeline:
 *  1. Parse the VCS log file
 *  2. Optionally group commits into time-based windows
 *  3. Run the requested analysis
 */
export async function runAnalysis(
  logFilePath: string,
  options: AppOptions
) {
  const commits = await parseCommits(logFilePath, options);
  const grouped = aggregateOnTemporalPeriod(commits, options);

  switch (options.analysis) {
    case "coupling":
      return byDegree(grouped, options);
    default:
      throw new Error(`Invalid analysis requested: ${options.analysis}.`);
  }
}
