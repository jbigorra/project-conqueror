import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Revision, RevisionsSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the revisions analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of Revision records.
 */
export const revisionsEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("revisions", input));
    const data = yield* Schema.decodeUnknown(RevisionsSchema)(raw);
    return yield* toAnalysis("revisions", data, input);
  });

/**
 * Runs a revisions analysis counting how many times each file was changed.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with revision counts per entity.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await revisions({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const revisions = (input: SimpleAnalysisInput): Promise<Analysis<Revision>> =>
  Effect.runPromise(revisionsEffect(input).pipe(Effect.provide(BehaveLive)));
