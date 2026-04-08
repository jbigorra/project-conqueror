import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type SummaryEntry, SummarySchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the summary analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of SummaryEntry records.
 */
export const summaryEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("summary", input));
    const data = yield* Schema.decodeUnknown(SummarySchema)(raw);
    return yield* toAnalysis("summary", data, input);
  });

/**
 * Runs a summary analysis returning high-level repository statistics.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with statistic name-value pairs (e.g. number-of-commits, number-of-entities).
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await summary({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const summary = (input: SimpleAnalysisInput): Promise<Analysis<SummaryEntry>> =>
  Effect.runPromise(summaryEffect(input).pipe(Effect.provide(BehaveLive)));
