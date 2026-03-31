import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type RefactoringMainDev, RefactoringMainDevSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

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

export const refactoringMainDev = (
  input: SimpleAnalysisInput,
): Promise<Analysis<RefactoringMainDev>> =>
  Effect.runPromise(refactoringMainDevEffect(input).pipe(Effect.provide(BehaveLive)));
