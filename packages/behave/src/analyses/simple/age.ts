import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { AgeSchema, type CodeAge } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import { FormatError } from "../../errors"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const ageEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    if (!input.ageTimeNow) {
      return yield* Effect.fail(new FormatError({ message: "ageTimeNow is required for age analysis" }))
    }
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("age", input)
    )
    const data = yield* Schema.decodeUnknown(AgeSchema)(raw)
    return yield* toAnalysis("age", data, input)
  })

export const age = (input: SimpleAnalysisInput): Promise<Analysis<CodeAge>> =>
  Effect.runPromise(ageEffect(input).pipe(Effect.provide(BehaveLive)))
