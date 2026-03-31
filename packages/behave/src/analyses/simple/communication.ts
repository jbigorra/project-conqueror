import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type Communication, CommunicationSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

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

export const communication = (input: SimpleAnalysisInput): Promise<Analysis<Communication>> =>
  Effect.runPromise(communicationEffect(input).pipe(Effect.provide(BehaveLive)));
