import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { EntityOwnershipSchema, type EntityOwnership } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const entityOwnershipEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("entity-ownership", input)
    )
    const data = yield* Schema.decodeUnknown(EntityOwnershipSchema)(raw)
    return yield* toAnalysis("entity-ownership", data, input)
  })

export const entityOwnership = (input: SimpleAnalysisInput): Promise<Analysis<EntityOwnership>> =>
  Effect.runPromise(entityOwnershipEffect(input).pipe(Effect.provide(BehaveLive)))
