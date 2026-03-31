import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type AbsChurn, AbsChurnSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const absChurnEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("abs-churn", input));
    const data = yield* Schema.decodeUnknown(AbsChurnSchema)(raw);
    return yield* toAnalysis("abs-churn", data, input);
  });

export const absChurn = (input: SimpleAnalysisInput): Promise<Analysis<AbsChurn>> =>
  Effect.runPromise(absChurnEffect(input).pipe(Effect.provide(BehaveLive)));
