import { Context, Effect, Layer } from "effect"
import { LizardInstance } from "@prj-conq/lizard-ts"
import { LizardError } from "../errors"
import { parseLizardCsv } from "../pipeline/extract/parse-lizard-csv"

export class LizardService extends Context.Tag("LizardService")<
  LizardService,
  {
    readonly analyze: (sourcePath: string) => Effect.Effect<unknown[], LizardError>
  }
>() {}

export const LizardLive = Layer.succeed(LizardService, {
  analyze: (sourcePath) =>
    Effect.tryPromise({
      try: async () => {
        const result = await LizardInstance.create().analyze(sourcePath)
        if (result instanceof Error) throw result
        return result
      },
      catch: (e) => new LizardError({ cause: e }),
    }).pipe(Effect.flatMap(parseLizardCsv)),
})
