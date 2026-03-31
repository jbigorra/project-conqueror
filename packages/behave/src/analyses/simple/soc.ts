import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Soc, SocSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const socEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("soc", input));
    const data = yield* Schema.decodeUnknown(SocSchema)(raw);
    return yield* toAnalysis("soc", data, input);
  });

export const soc = (input: SimpleAnalysisInput): Promise<Analysis<Soc>> =>
  Effect.runPromise(socEffect(input).pipe(Effect.provide(BehaveLive)));
