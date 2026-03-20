import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { AuthorsSchema, type Author } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const authorsEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("authors", input)
    )
    const data = yield* Schema.decodeUnknown(AuthorsSchema)(raw)
    return yield* toAnalysis("authors", data, input)
  })

export const authors = (input: SimpleAnalysisInput): Promise<Analysis<Author>> =>
  Effect.runPromise(authorsEffect(input).pipe(Effect.provide(BehaveLive)))
