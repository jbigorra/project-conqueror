import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Coupling, CouplingSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the temporal coupling analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of Coupling records.
 */
export const couplingEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("coupling", input));
    const data = yield* Schema.decodeUnknown(CouplingSchema)(raw);
    return yield* toAnalysis("coupling", data, input);
  });

/**
 * Runs a temporal coupling analysis detecting files that change together.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with coupled entity pairs and coupling degrees.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await coupling({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const coupling = (input: SimpleAnalysisInput): Promise<Analysis<Coupling>> =>
  Effect.runPromise(couplingEffect(input).pipe(Effect.provide(BehaveLive)));
