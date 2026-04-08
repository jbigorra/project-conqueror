import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type AbsChurn, AbsChurnSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the absolute churn analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of AbsChurn records.
 */
export const absChurnEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("abs-churn", input));
    const data = yield* Schema.decodeUnknown(AbsChurnSchema)(raw);
    return yield* toAnalysis("abs-churn", data, input);
  });

/**
 * Runs an absolute churn analysis showing lines added/deleted per date.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with daily churn metrics.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await absChurn({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const absChurn = (input: SimpleAnalysisInput): Promise<Analysis<AbsChurn>> =>
  Effect.runPromise(absChurnEffect(input).pipe(Effect.provide(BehaveLive)));
