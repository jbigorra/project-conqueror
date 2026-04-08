import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type MainDev, MainDevSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the main-developer analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of MainDev records.
 */
export const mainDevEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("main-dev", input));
    const data = yield* Schema.decodeUnknown(MainDevSchema)(raw);
    return yield* toAnalysis("main-dev", data, input);
  });

/**
 * Runs a main-developer analysis identifying the primary author per file by lines added.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with main developer and ownership per entity.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await mainDev({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const mainDev = (input: SimpleAnalysisInput): Promise<Analysis<MainDev>> =>
  Effect.runPromise(mainDevEffect(input).pipe(Effect.provide(BehaveLive)));
