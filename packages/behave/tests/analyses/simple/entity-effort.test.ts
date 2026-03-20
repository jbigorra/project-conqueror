import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { entityEffortEffect } from "../../../src/analyses/simple/entity-effort"
import { CodeMaatService } from "../../../src/services/code-maat"

describe("entity-effort analysis", () => {
  const cannedData = [{ entity: "foo.ts", author: "alice", authorRevs: 8, totalRevs: 10 }]
  const TestLayer = Layer.succeed(CodeMaatService, {
    runAnalysis: () => Effect.succeed(cannedData),
  })

  test("returns Analysis with JSON data by default", async () => {
    const result = await Effect.runPromise(
      entityEffortEffect({ gitLogPath: "/path/log" }).pipe(Effect.provide(TestLayer))
    )
    expect(result.metadata.analysisName).toBe("entity-effort")
    expect(result.metadata.format).toBe("json")
    expect(result.data).toEqual(cannedData)
  })

  test("returns Analysis with CSV data when format=csv", async () => {
    const result = await Effect.runPromise(
      entityEffortEffect({ gitLogPath: "/path/log", format: "csv" }).pipe(Effect.provide(TestLayer))
    )
    expect(result.metadata.format).toBe("csv")
    expect(typeof result.data).toBe("string")
  })

  test("passes options through to CodeMaatService", async () => {
    let capturedOptions: unknown
    const SpyLayer = Layer.succeed(CodeMaatService, {
      runAnalysis: (_path, opts) => { capturedOptions = opts; return Effect.succeed(cannedData) },
    })
    await Effect.runPromise(
      entityEffortEffect({ gitLogPath: "/path/log", vcsType: "git2" }).pipe(Effect.provide(SpyLayer))
    )
    expect(capturedOptions).toEqual(expect.objectContaining({ analysis: "entity-effort", versionControl: "git2" }))
  })
})
