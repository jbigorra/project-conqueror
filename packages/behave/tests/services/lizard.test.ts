import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { LizardService, LizardLive } from "../../src/services/lizard"

describe("LizardService", () => {
  test("can be provided with a test layer", async () => {
    const testData = [{ file: "/src/foo.ts", nloc: "50", cyclomatic_complexity: "10" }]
    const TestLayer = Layer.succeed(LizardService, {
      analyze: () => Effect.succeed(testData),
    })
    const program = Effect.gen(function* () {
      const service = yield* LizardService
      return yield* service.analyze("/path/to/source")
    })
    const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)))
    expect(result).toEqual(testData)
  })

  test("LizardLive wraps errors as LizardError", async () => {
    const program = Effect.gen(function* () {
      const service = yield* LizardService
      return yield* service.analyze("/nonexistent/path")
    })
    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(LizardLive)))
    expect(exit._tag).toBe("Failure")
  })
})
