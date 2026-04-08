import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Communication, CommunicationSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the communication analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of Communication records.
 */
export const communicationEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("communication", input),
    );
    const data = yield* Schema.decodeUnknown(CommunicationSchema)(raw);
    return yield* toAnalysis("communication", data, input);
  });

/**
 * Runs a communication analysis detecting implicit collaboration between authors.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with author-peer communication pairs.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await communication({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const communication = (input: SimpleAnalysisInput): Promise<Analysis<Communication>> =>
  Effect.runPromise(communicationEffect(input).pipe(Effect.provide(BehaveLive)));
