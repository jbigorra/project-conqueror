/**
 * @module code-mat-port
 *
 * TypeScript port of [code-maat](https://github.com/adamtornhill/code-maat).
 *
 * Provides VCS log parsers, analysis algorithms, and an orchestration layer
 * for computing coupling, churn, authorship, and other software evolution metrics.
 *
 * @example
 * import { runAnalysis } from "@prj-conq/code-maat-port";
 *
 * const results = await runAnalysis("git.log", {
 *   versionControl: "git",
 *   analysis: "coupling",
 *   minRevs: 5,
 *   minSharedRevs: 5,
 *   minCoupling: 30,
 *   maxCoupling: 100,
 *   maxChangesetSize: 30,
 * });
 */

// --- Analysis (aliased to avoid conflicts) ---
export {
  all as allAuthors,
  byCount,
  ofModule,
} from "./code_maat/analysis/authors";
// --- Analysis (no naming conflicts) ---
export * from "./code_maat/analysis/churn";
export * from "./code_maat/analysis/code-age";
export * from "./code_maat/analysis/commit-messages";
export * from "./code_maat/analysis/communication";
export * from "./code_maat/analysis/coupling-algos";
export * from "./code_maat/analysis/effort";
export {
  all as allEntities,
  allRevisions,
  byRevision,
  type EntityRevCount,
  revisionsOf,
} from "./code_maat/analysis/entities";
export {
  byDegree as couplingByDegree,
  type CouplingResult,
} from "./code_maat/analysis/logical-coupling";
export * from "./code_maat/analysis/math";
export {
  asSoc,
  byDegree as socByDegree,
  type SocResult,
} from "./code_maat/analysis/sum-of-coupling";
export * from "./code_maat/analysis/summary";

// --- App (no naming conflicts) ---
export * from "./code_maat/app/app";
// --- App (aliased to avoid conflicts) ---
export {
  type GroupSpec,
  mapEntitiesToGroups,
  run as runGrouper,
  textToGroupSpecification,
} from "./code_maat/app/grouper";
export {
  fileToAuthorTeamLookup,
  run as runTeamMapper,
} from "./code_maat/app/team-mapper";
export * from "./code_maat/app/time-based-grouper";

// --- Infrastructure ---
export * from "./code_maat/cmd-line";
export * from "./code_maat/dataset/dataset";

// --- Parsers (aliased to avoid conflicts) ---
export {
  type ParsedEntry as GitParsedEntry,
  parseLog as parseGitLog,
  parseReadLog as parseGitReadLog,
} from "./code_maat/parsers/git";

export {
  type ParsedEntry as Git2ParsedEntry,
  parseLog as parseGit2Log,
  parseReadLog as parseGit2ReadLog,
} from "./code_maat/parsers/git2";

export {
  type MercurialEntry,
  parseLog as parseMercurialLog,
  parseReadLog as parseMercurialReadLog,
} from "./code_maat/parsers/mercurial";

export {
  type PerforceEntry,
  parseLog as parsePerforceLog,
  parseReadLog as parsePerforceReadLog,
} from "./code_maat/parsers/perforce";

export {
  asRows as svnAsRows,
  parseLog as parseSvnLog,
  parseReadLog as parseSvnReadLog,
  parseXml as parseSvnXml,
  type SvnEntry,
  type SvnLogEntry,
} from "./code_maat/parsers/svn";

export {
  parseLog as parseTfsLog,
  parseReadLog as parseTfsReadLog,
  type TfsEntry,
} from "./code_maat/parsers/tfs";

export * from "./code_maat/parsers/time-parser";

// --- Types ---
export * from "./code_maat/types";
