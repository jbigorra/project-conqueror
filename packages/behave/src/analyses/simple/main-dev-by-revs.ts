import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { MainDevByRevsSchema, type MainDevByRevs } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const mainDevByRevsEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("main-dev-by-revs", input)
    )
    const data = yield* Schema.decodeUnknown(MainDevByRevsSchema)(raw)
    return yield* toAnalysis("main-dev-by-revs", data, input)
  })

export const mainDevByRevs = (input: SimpleAnalysisInput): Promise<Analysis<MainDevByRevs>> =>
  Effect.runPromise(mainDevByRevsEffect(input).pipe(Effect.provide(BehaveLive)))
