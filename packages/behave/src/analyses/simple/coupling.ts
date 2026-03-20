import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { CouplingSchema, type Coupling } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const couplingEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("coupling", input)
    )
    const data = yield* Schema.decodeUnknown(CouplingSchema)(raw)
    return yield* toAnalysis("coupling", data, input)
  })

export const coupling = (input: SimpleAnalysisInput): Promise<Analysis<Coupling>> =>
  Effect.runPromise(couplingEffect(input).pipe(Effect.provide(BehaveLive)))
