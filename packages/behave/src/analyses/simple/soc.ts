import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Soc, SocSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the sum-of-coupling analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of Soc records.
 */
export const socEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("soc", input));
    const data = yield* Schema.decodeUnknown(SocSchema)(raw);
    return yield* toAnalysis("soc", data, input);
  });

/**
 * Runs a sum-of-coupling analysis measuring total coupling per entity.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with sum-of-coupling values per entity.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await soc({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const soc = (input: SimpleAnalysisInput): Promise<Analysis<Soc>> =>
  Effect.runPromise(socEffect(input).pipe(Effect.provide(BehaveLive)));
