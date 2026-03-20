import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { SummarySchema, type SummaryEntry } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const summaryEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("summary", input)
    )
    const data = yield* Schema.decodeUnknown(SummarySchema)(raw)
    return yield* toAnalysis("summary", data, input)
  })

export const summary = (input: SimpleAnalysisInput): Promise<Analysis<SummaryEntry>> =>
  Effect.runPromise(summaryEffect(input).pipe(Effect.provide(BehaveLive)))
