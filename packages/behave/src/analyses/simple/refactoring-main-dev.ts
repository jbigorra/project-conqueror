import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type RefactoringMainDev, RefactoringMainDevSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

/**
 * Effect program that runs the refactoring main-developer analysis and decodes the result.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns An Effect producing an Analysis of RefactoringMainDev records.
 */
export const refactoringMainDevEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("refactoring-main-dev", input),
    );
    const data = yield* Schema.decodeUnknown(RefactoringMainDevSchema)(raw);
    return yield* toAnalysis("refactoring-main-dev", data, input);
  });

/**
 * Runs a refactoring main-developer analysis identifying who removes the most code per file.
 *
 * @param input - Analysis input with git log path and optional thresholds.
 * @returns Resolved analysis with refactoring main developer and ownership per entity.
 * @throws {CodeMaatError} If code-maat analysis fails.
 *
 * @example
 * ```ts
 * const result = await refactoringMainDev({ gitLogPath: "/tmp/project.log" });
 * ```
 */
export const refactoringMainDev = (
  input: SimpleAnalysisInput,
): Promise<Analysis<RefactoringMainDev>> =>
  Effect.runPromise(refactoringMainDevEffect(input).pipe(Effect.provide(BehaveLive)));
