import { Effect, Schema } from "effect";
import { FormatError } from "../../errors";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { AgeSchema, type CodeAge } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the code age analysis and decodes the result.
 *
 * @param input - Analysis input; requires `ageTimeNow` in "YYYY-MM-DD" format.
 * @returns An Effect producing an Analysis of CodeAge records.
 */
export const ageEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    if (!input.ageTimeNow) {
      return yield* Effect.fail(
        new FormatError({ message: "ageTimeNow is required for age analysis" }),
      );
    }
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("age", input));
    const data = yield* Schema.decodeUnknown(AgeSchema)(raw);
    return yield* toAnalysis("age", data, input);
  });

/**
 * Runs a code age analysis measuring how old each file is relative to a reference date.
 *
 * @param input - Analysis input; `ageTimeNow` (format "YYYY-MM-DD") is required.
 * @returns Resolved analysis with age in months per entity.
 * @throws {FormatError} If `ageTimeNow` is not provided.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await age({ gitLogPath: "/tmp/project.log", ageTimeNow: "2026-04-01" });
 * ```
 */
export const age = (input: SimpleAnalysisInput): Promise<Analysis<CodeAge>> =>
  Effect.runPromise(ageEffect(input).pipe(Effect.provide(BehaveLive)));
