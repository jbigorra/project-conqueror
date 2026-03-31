import { Effect, Schema } from "effect";
import { buildAppOptions } from "../../pipeline/extract/build-app-options";
import { toAnalysis } from "../../pipeline/load/to-analysis";
import type { Analysis } from "../../schemas/analysis";
import { type EntityOwnership, EntityOwnershipSchema } from "../../schemas/code-maat";
import { BehaveLive } from "../../services";
import { CodeMaatService } from "../../services/code-maat";
import type { SimpleAnalysisInput } from "../../types";

export const entityOwnershipEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService;
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("entity-ownership", input),
    );
    const data = yield* Schema.decodeUnknown(EntityOwnershipSchema)(raw);
    return yield* toAnalysis("entity-ownership", data, input);
  });

export const entityOwnership = (input: SimpleAnalysisInput): Promise<Analysis<EntityOwnership>> =>
  Effect.runPromise(entityOwnershipEffect(input).pipe(Effect.provide(BehaveLive)));
