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

// --- Analysis (no naming conflicts) ---
export * from "./code_maat/analysis/churn";
export * from "./code_maat/analysis/code-age";
export * from "./code_maat/analysis/commit-messages";
export * from "./code_maat/analysis/communication";
export * from "./code_maat/analysis/coupling-algos";
export * from "./code_maat/analysis/effort";
export * from "./code_maat/analysis/math";
export * from "./code_maat/analysis/summary";

// --- Analysis (aliased to avoid conflicts) ---
export {
	all as allAuthors,
	ofModule,
	byCount,
} from "./code_maat/analysis/authors";

export {
	type EntityRevCount,
	all as allEntities,
	allRevisions,
	byRevision,
	revisionsOf,
} from "./code_maat/analysis/entities";

export {
	type CouplingResult,
	byDegree as couplingByDegree,
} from "./code_maat/analysis/logical-coupling";

export {
	type SocResult,
	asSoc,
	byDegree as socByDegree,
} from "./code_maat/analysis/sum-of-coupling";

// --- App (no naming conflicts) ---
export * from "./code_maat/app/app";
export * from "./code_maat/app/time-based-grouper";

// --- App (aliased to avoid conflicts) ---
export {
	type GroupSpec,
	textToGroupSpecification,
	mapEntitiesToGroups,
	run as runGrouper,
} from "./code_maat/app/grouper";

export {
	fileToAuthorTeamLookup,
	run as runTeamMapper,
} from "./code_maat/app/team-mapper";

// --- Infrastructure ---
export * from "./code_maat/cmd-line";
export * from "./code_maat/dataset/dataset";

// --- Parsers (aliased to avoid conflicts) ---
export {
	type ParsedEntry as GitParsedEntry,
	parseReadLog as parseGitReadLog,
	parseLog as parseGitLog,
} from "./code_maat/parsers/git";

export {
	type ParsedEntry as Git2ParsedEntry,
	parseReadLog as parseGit2ReadLog,
	parseLog as parseGit2Log,
} from "./code_maat/parsers/git2";

export {
	type MercurialEntry,
	parseReadLog as parseMercurialReadLog,
	parseLog as parseMercurialLog,
} from "./code_maat/parsers/mercurial";

export {
	type PerforceEntry,
	parseReadLog as parsePerforceReadLog,
	parseLog as parsePerforceLog,
} from "./code_maat/parsers/perforce";

export {
	type SvnEntry,
	type SvnLogEntry,
	parseXml as parseSvnXml,
	asRows as svnAsRows,
	parseLog as parseSvnLog,
	parseReadLog as parseSvnReadLog,
} from "./code_maat/parsers/svn";

export {
	type TfsEntry,
	parseReadLog as parseTfsReadLog,
	parseLog as parseTfsLog,
} from "./code_maat/parsers/tfs";

export * from "./code_maat/parsers/time-parser";

// --- Types ---
export * from "./code_maat/types";
