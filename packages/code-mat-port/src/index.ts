/**
 * @module code-mat-port
 *
 * TypeScript port of [code-maat](https://github.com/adamtornhill/code-maat).
 *
 * Provides VCS log parsers, analysis algorithms, and an orchestration layer
 * for computing coupling, churn, authorship, and other software evolution metrics.
 *
 * @example
 * import { app } from "code-mat-port";
 *
 * const results = await app.runAnalysis("git.log", {
 *   versionControl: "git",
 *   analysis: "coupling",
 *   minRevs: 5,
 *   minSharedRevs: 5,
 *   minCoupling: 30,
 *   maxCoupling: 100,
 *   maxChangesetSize: 30,
 * });
 */
export * as authors from "./code_maat/analysis/authors";
export * as churn from "./code_maat/analysis/churn";
export * as codeAge from "./code_maat/analysis/code-age";
export * as commitMessages from "./code_maat/analysis/commit-messages";
export * as communication from "./code_maat/analysis/communication";
export * as couplingAlgos from "./code_maat/analysis/coupling-algos";
export * as effort from "./code_maat/analysis/effort";
export * as entities from "./code_maat/analysis/entities";
export * as logicalCoupling from "./code_maat/analysis/logical-coupling";
export * as math from "./code_maat/analysis/math";
export * as sumOfCoupling from "./code_maat/analysis/sum-of-coupling";
export * as summary from "./code_maat/analysis/summary";
export * as app from "./code_maat/app/app";
export type { AppOptions } from "./code_maat/app/app";
export * as grouper from "./code_maat/app/grouper";
export * as teamMapper from "./code_maat/app/team-mapper";
export * as timeBasedGrouper from "./code_maat/app/time-based-grouper";
export * as cmdLine from "./code_maat/cmd-line";
export * as dataset from "./code_maat/dataset/dataset";
export * as gitParser from "./code_maat/parsers/git";
export * as git2Parser from "./code_maat/parsers/git2";
export * as mercurialParser from "./code_maat/parsers/mercurial";
export * as perforceParser from "./code_maat/parsers/perforce";
export * as svnParser from "./code_maat/parsers/svn";
export * as tfsParser from "./code_maat/parsers/tfs";
export * as timeParser from "./code_maat/parsers/time-parser";
export * from "./code_maat/types";
