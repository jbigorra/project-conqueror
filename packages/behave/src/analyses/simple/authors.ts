import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Author, AuthorsSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the authors analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of Author records.
 */
export const authorsEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("authors", input));
    const data = yield* Schema.decodeUnknown(AuthorsSchema)(raw);
    return yield* toAnalysis("authors", data, input);
  });

/**
 * Runs an authors analysis counting distinct authors and revisions per file.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with author counts per entity.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await authors({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const authors = (input: SimpleAnalysisInput): Promise<Analysis<Author>> =>
  Effect.runPromise(authorsEffect(input).pipe(Effect.provide(BehaveLive)));
