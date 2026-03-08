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

export type AppOptions = AnalysisOptions & {
  versionControl: string;
  analysis: string;
  temporalPeriod?: string;
  group?: string;
  teamMapFile?: string;
  ageTimeNow?: string;
  expressionToMatch?: string;
};

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

function aggregate(commits: VCSEntry[], options: AppOptions): VCSEntry[] {
  let r = commits;
  if (options.group) r = runGrouper(options.group, r) as VCSEntry[];
  if (options.temporalPeriod)
    r = byTimePeriod(r as (VCSEntry & { date: string })[], {
      temporalPeriod: options.temporalPeriod!,
    }) as VCSEntry[];
  if (options.teamMapFile) r = runTeamMapper(r, fileToAuthorTeamLookup(options.teamMapFile));
  return r;
}

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

export async function runAnalysis(logFilePath: string, options: AppOptions): Promise<unknown[]> {
  return runAnalysisOn(aggregate(await parseCommits(logFilePath, options), options), options);
}
