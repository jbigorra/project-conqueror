import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Fragmentation, FragmentationSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the fragmentation analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of Fragmentation records.
 */
export const fragmentationEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("fragmentation", input),
    );
    const data = yield* Schema.decodeUnknown(FragmentationSchema)(raw);
    return yield* toAnalysis("fragmentation", data, input);
  });

/**
 * Runs a fragmentation analysis measuring knowledge distribution across authors per file.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with fractal values per entity (0 = single author, 1 = fragmented).
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await fragmentation({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const fragmentation = (input: SimpleAnalysisInput): Promise<Analysis<Fragmentation>> =>
  Effect.runPromise(fragmentationEffect(input).pipe(Effect.provide(BehaveLive)));
