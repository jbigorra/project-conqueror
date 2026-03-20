import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { EntityChurnSchema, type EntityChurn } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const entityChurnEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("entity-churn", input)
    )
    const data = yield* Schema.decodeUnknown(EntityChurnSchema)(raw)
    return yield* toAnalysis("entity-churn", data, input)
  })

export const entityChurn = (input: SimpleAnalysisInput): Promise<Analysis<EntityChurn>> =>
  Effect.runPromise(entityChurnEffect(input).pipe(Effect.provide(BehaveLive)))
