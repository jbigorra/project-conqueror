import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type MainDevByRevs, MainDevByRevsSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the main-developer-by-revisions analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of MainDevByRevs records.
 */
export const mainDevByRevsEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("main-dev-by-revs", input),
    );
    const data = yield* Schema.decodeUnknown(MainDevByRevsSchema)(raw);
    return yield* toAnalysis("main-dev-by-revs", data, input);
  });

/**
 * Runs a main-developer-by-revisions analysis identifying the primary author per file by commit count.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with main developer and ownership per entity.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await mainDevByRevs({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const mainDevByRevs = (input: SimpleAnalysisInput): Promise<Analysis<MainDevByRevs>> =>
  Effect.runPromise(mainDevByRevsEffect(input).pipe(Effect.provide(BehaveLive)));
