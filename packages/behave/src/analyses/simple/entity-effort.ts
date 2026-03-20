import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { EntityEffortSchema, type EntityEffort } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const entityEffortEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("entity-effort", input)
    )
    const data = yield* Schema.decodeUnknown(EntityEffortSchema)(raw)
    return yield* toAnalysis("entity-effort", data, input)
  })

export const entityEffort = (input: SimpleAnalysisInput): Promise<Analysis<EntityEffort>> =>
  Effect.runPromise(entityEffortEffect(input).pipe(Effect.provide(BehaveLive)))
