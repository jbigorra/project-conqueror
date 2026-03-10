/**
 * Port of code_maat.app.app
 *
 * Top-level orchestration module that glues parsers, groupers, and analyses
 * into a pipeline. Supports all VCS formats and all 18 analyses.
 */

import * as authors from "../analysis/authors";
import * as churn from "../analysis/churn";
import * as codeAge from "../analysis/code-age";
import * as commitMessages from "../analysis/commit-messages";
import * as communication from "../analysis/communication";
import * as effort from "../analysis/effort";
import * as entities from "../analysis/entities";
import * as logicalCoupling from "../analysis/logical-coupling";
import * as sumOfCoupling from "../analysis/sum-of-coupling";
import * as summary from "../analysis/summary";
import { parseLog as parseGitLog } from "../parsers/git";
import { parseLog as parseGit2Log } from "../parsers/git2";
import { parseLog as parseHgLog } from "../parsers/mercurial";
import { parseLog as parseP4Log } from "../parsers/perforce";
import { parseReadLog as parseSvnLog } from "../parsers/svn";
import { parseLog as parseTfsLog } from "../parsers/tfs";
import type { AnalysisOptions, VCSEntry } from "../types";
import { run as runGrouper } from "./grouper";
import { fileToAuthorTeamLookup, run as runTeamMapper } from "./team-mapper";
import { byTimePeriod } from "./time-based-grouper";

/**
 * Full set of options accepted by the top-level `runAnalysis` pipeline.
 *
 * Extends `AnalysisOptions` (filtering thresholds) with orchestration controls
 * that select the VCS parser, analysis algorithm, and optional pre-processing
 * steps (grouping, time-windowing, team mapping).
 */
export type AppOptions = AnalysisOptions & {
  /** VCS format of the log file. Supported: `"git"`, `"git2"`, `"hg"`, `"p4"`, `"tfs"`, `"svn"`. */
  versionControl: string;
  /** Analysis to run. Supported: `"authors"`, `"revisions"`, `"coupling"`, `"soc"`, `"summary"`,
   *  `"identity"`, `"abs-churn"`, `"author-churn"`, `"entity-churn"`, `"entity-ownership"`,
   *  `"main-dev"`, `"refactoring-main-dev"`, `"entity-effort"`, `"main-dev-by-revs"`,
   *  `"fragmentation"`, `"communication"`, `"messages"`, `"age"`. */
  analysis: string;
  /** When set, commits are re-grouped into sliding time windows of this many days (as a string integer). */
  temporalPeriod?: string;
  /** Multi-line group spec text (`path => name`). When set, entities are mapped to architectural groups before analysis. */
  group?: string;
  /** CSV text with columns `author,team`. When set, author names are replaced with team names before analysis. */
  teamMapFile?: string;
  /** Reference date string (`YYYY-MM-DD`) used as "now" for code-age analysis. */
  ageTimeNow?: string;
  /** Regex expression string used to filter commit messages in the `"messages"` analysis. */
  expressionToMatch?: string;
};

/**
 * Reads and parses a VCS log file into an array of `VCSEntry` records.
 *
 * Dispatches to the correct parser based on `options.versionControl`. SVN is
 * read synchronously via `Bun.file`; all other parsers are async file readers.
 * Throws a descriptive error for unknown `versionControl` values.
 *
 * Requires the Bun runtime — all parsers use `Bun.file` for disk I/O.
 *
 * @param logFilePath - Absolute path to the VCS log file on disk.
 * @param options - Must contain a valid `versionControl` value.
 * @returns A promise that resolves to an array of parsed `VCSEntry` objects.
 */
async function parseCommits(logFilePath: string, options: AppOptions): Promise<VCSEntry[]> {
  const { versionControl } = options;
  switch (versionControl) {
    case "git":
      return (await parseGitLog(logFilePath, {})) as VCSEntry[];
    case "git2":
      return (await parseGit2Log(logFilePath, {})) as VCSEntry[];
    case "hg":
      return (await parseHgLog(logFilePath, {})) as VCSEntry[];
    case "p4":
      return (await parseP4Log(logFilePath, {})) as VCSEntry[];
    case "tfs":
      return (await parseTfsLog(logFilePath, {})) as VCSEntry[];
    case "svn":
      return parseSvnLog(await Bun.file(logFilePath).text()) as VCSEntry[];
    default:
      throw new Error(
        `Invalid --version-control specified: ${versionControl}. Supported options are: git, git2, hg, p4, tfs, svn.`,
      );
  }
}

/**
 * Applies optional pre-processing transformations to a parsed list of commits.
 *
 * Transformations are applied in a fixed order: architectural grouping (if
 * `options.group` is set) → time-based windowing (if `options.temporalPeriod`
 * is set) → team mapping (if `options.teamMapFile` is set). Each step is
 * skipped when its corresponding option is absent, so the function is a
 * no-op when no options are supplied.
 *
 * @param commits - Array of `VCSEntry` records produced by `parseCommits`.
 * @param options - Controls which transformations are applied. Only
 *   `group`, `temporalPeriod`, and `teamMapFile` are consulted.
 * @returns The transformed `VCSEntry` array, ready for analysis.
 */
function aggregate(commits: VCSEntry[], options: AppOptions): VCSEntry[] {
  let r = commits;
  if (options.group) r = runGrouper(options.group, r) as VCSEntry[];
  if (options.temporalPeriod) {
    const temporalPeriod = options.temporalPeriod;
    r = byTimePeriod(r as (VCSEntry & { date: string })[], {
      temporalPeriod,
    }) as VCSEntry[];
  }
  if (options.teamMapFile) r = runTeamMapper(r, fileToAuthorTeamLookup(options.teamMapFile));
  return r;
}

/**
 * Dispatches pre-processed entries to the requested analysis function.
 *
 * Reads `options.analysis` and calls the corresponding analysis module. Each
 * analysis returns an array of result records whose shape depends on the
 * chosen analysis (e.g. `{ entity, nRevs }` for `"revisions"`). Throws a
 * descriptive error if `options.analysis` is not one of the 18 supported
 * values.
 *
 * @param entries - Aggregated `VCSEntry` array from `aggregate`.
 * @param options - Must contain a valid `analysis` string. Additional
 *   fields such as `ageTimeNow` and `expressionToMatch` are forwarded to the
 *   relevant analysis when needed.
 * @returns An array of plain result objects whose shape is determined by the
 *   chosen analysis.
 */
function runAnalysisOn(entries: VCSEntry[], options: AppOptions): unknown[] {
  switch (options.analysis) {
    case "authors":
      return authors.byCount(entries, options);
    case "revisions":
      return entities.byRevision(entries, options);
    case "coupling":
      return logicalCoupling.byDegree(entries, options);
    case "soc":
      return sumOfCoupling.byDegree(entries, options);
    case "summary":
      return summary.overview(entries);
    case "identity":
      return entries;
    case "abs-churn":
      return churn.absolutesTrend(entries, options);
    case "author-churn":
      return churn.byAuthor(entries, options);
    case "entity-churn":
      return churn.byEntity(entries, options);
    case "entity-ownership":
      return churn.asOwnership(entries, options);
    case "main-dev":
      return churn.byMainDeveloper(entries, options);
    case "refactoring-main-dev":
      return churn.byRefactoringMainDeveloper(entries, options);
    case "entity-effort":
      return effort.asRevisionsPerAuthor(entries, options);
    case "main-dev-by-revs":
      return effort.asMainDeveloperByRevisions(entries, options);
    case "fragmentation":
      return effort.asEntityFragmentation(entries, options);
    case "communication":
      return communication.bySharedEntities(entries);
    case "messages":
      return commitMessages.byWordFrequency(entries, {
        expressionToMatch: options.expressionToMatch ?? "",
      });
    case "age":
      return codeAge.byAge(entries, options.ageTimeNow);
    default:
      throw new Error(
        `Invalid analysis requested: ${options.analysis}. Supported analyses are: authors, revisions, coupling, soc, summary, identity, abs-churn, author-churn, entity-churn, entity-ownership, main-dev, refactoring-main-dev, entity-effort, main-dev-by-revs, fragmentation, communication, messages, age.`,
      );
  }
}

/**
 * Runs the full Code Maat analysis pipeline: parse → aggregate → analyse.
 *
 * This is the primary public entry point of the library. It reads the VCS log
 * file at `logFilePath`, applies any requested pre-processing (architectural
 * grouping, time-window re-grouping, team mapping), then runs the chosen
 * analysis and returns its results. The shape of each result object depends on
 * `options.analysis` — for example, `"revisions"` returns `{ entity, nRevs }`,
 * `"authors"` returns `{ entity, nAuthors }`, and `"summary"` returns
 * `{ statistic, value }` rows.
 *
 * @param logFilePath - Absolute path to the VCS log file on disk.
 * @param options - Full pipeline options: VCS format, analysis name, filtering
 *   thresholds, and optional grouping/mapping controls. See `AppOptions` for
 *   all fields.
 * @returns A promise that resolves to an array of plain result objects. The
 *   exact shape of each object is determined by `options.analysis`.
 *
 * @example
 * await runAnalysis("/path/to/git.log", {
 *   versionControl: "git",
 *   analysis: "revisions",
 *   minRevs: 1,
 *   minSharedRevs: 1,
 *   minCoupling: 0,
 *   maxCoupling: 100,
 *   maxChangesetSize: 1000,
 * });
 * // [{ entity: "src/app.ts", nRevs: 5 }, { entity: "src/index.ts", nRevs: 3 }]
 */
export async function runAnalysis(logFilePath: string, options: AppOptions): Promise<unknown[]> {
  return runAnalysisOn(aggregate(await parseCommits(logFilePath, options), options), options);
}
