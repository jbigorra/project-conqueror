import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type AuthorChurn, AuthorChurnSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the author churn analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of AuthorChurn records.
 */
export const authorChurnEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("author-churn", input),
    );
    const data = yield* Schema.decodeUnknown(AuthorChurnSchema)(raw);
    return yield* toAnalysis("author-churn", data, input);
  });

/**
 * Runs an author churn analysis showing lines added/deleted per author.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with per-author churn metrics.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await authorChurn({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const authorChurn = (input: SimpleAnalysisInput): Promise<Analysis<AuthorChurn>> =>
  Effect.runPromise(authorChurnEffect(input).pipe(Effect.provide(BehaveLive)));
