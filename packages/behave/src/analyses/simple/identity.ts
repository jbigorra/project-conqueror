import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { IdentitySchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the identity analysis and passes through raw records.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of untyped records.
 */
export const identityEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("identity", input));
    const data = yield* Schema.decodeUnknown(IdentitySchema)(raw);
    return yield* toAnalysis("identity", data, input);
  });

/**
 * Runs an identity analysis returning raw code-maat records without schema decoding.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with untyped records.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await identity({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const identity = (input: SimpleAnalysisInput): Promise<Analysis<unknown>> =>
  Effect.runPromise(identityEffect(input).pipe(Effect.provide(BehaveLive)));
