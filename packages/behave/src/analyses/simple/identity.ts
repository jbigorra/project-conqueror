import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { IdentitySchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const identityEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(input.gitLogPath, buildAppOptions("identity", input));
    const data = yield* Schema.decodeUnknown(IdentitySchema)(raw);
    return yield* toAnalysis("identity", data, input);
  });

export const identity = (input: SimpleAnalysisInput): Promise<Analysis<unknown>> =>
  Effect.runPromise(identityEffect(input).pipe(Effect.provide(BehaveLive)));
