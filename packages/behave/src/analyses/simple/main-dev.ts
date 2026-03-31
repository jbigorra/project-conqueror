import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type MainDev, MainDevSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const mainDevEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("main-dev", input));
    const data = yield* Schema.decodeUnknown(MainDevSchema)(raw);
    return yield* toAnalysis("main-dev", data, input);
  });

export const mainDev = (input: SimpleAnalysisInput): Promise<Analysis<MainDev>> =>
  Effect.runPromise(mainDevEffect(input).pipe(Effect.provide(BehaveLive)));
