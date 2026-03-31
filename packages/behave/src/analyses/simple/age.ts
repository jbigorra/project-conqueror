import { Effect, Schema } from "effect";
import { FormatError } from "../../errors";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { AgeSchema, type CodeAge } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const ageEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    if (!input.ageTimeNow) {
      return yield* Effect.fail(
        new FormatError({ message: "ageTimeNow is required for age analysis" }),
      );
    }
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("age", input));
    const data = yield* Schema.decodeUnknown(AgeSchema)(raw);
    return yield* toAnalysis("age", data, input);
  });

export const age = (input: SimpleAnalysisInput): Promise<Analysis<CodeAge>> =>
  Effect.runPromise(ageEffect(input).pipe(Effect.provide(BehaveLive)));
