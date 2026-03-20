import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { AuthorChurnSchema, type AuthorChurn } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const authorChurnEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("author-churn", input)
    )
    const data = yield* Schema.decodeUnknown(AuthorChurnSchema)(raw)
    return yield* toAnalysis("author-churn", data, input)
  })

export const authorChurn = (input: SimpleAnalysisInput): Promise<Analysis<AuthorChurn>> =>
  Effect.runPromise(authorChurnEffect(input).pipe(Effect.provide(BehaveLive)))
