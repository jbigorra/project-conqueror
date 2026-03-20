import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { FragmentationSchema, type Fragmentation } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const fragmentationEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("fragmentation", input)
    )
    const data = yield* Schema.decodeUnknown(FragmentationSchema)(raw)
    return yield* toAnalysis("fragmentation", data, input)
  })

export const fragmentation = (input: SimpleAnalysisInput): Promise<Analysis<Fragmentation>> =>
  Effect.runPromise(fragmentationEffect(input).pipe(Effect.provide(BehaveLive)))
