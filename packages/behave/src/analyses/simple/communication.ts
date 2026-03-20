import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { CommunicationSchema, type Communication } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const communicationEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("communication", input)
    )
    const data = yield* Schema.decodeUnknown(CommunicationSchema)(raw)
    return yield* toAnalysis("communication", data, input)
  })

export const communication = (input: SimpleAnalysisInput): Promise<Analysis<Communication>> =>
  Effect.runPromise(communicationEffect(input).pipe(Effect.provide(BehaveLive)))
