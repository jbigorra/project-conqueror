import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { MainDevSchema, type MainDev } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const mainDevEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("main-dev", input)
    )
    const data = yield* Schema.decodeUnknown(MainDevSchema)(raw)
    return yield* toAnalysis("main-dev", data, input)
  })

export const mainDev = (input: SimpleAnalysisInput): Promise<Analysis<MainDev>> =>
  Effect.runPromise(mainDevEffect(input).pipe(Effect.provide(BehaveLive)))
