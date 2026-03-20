import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { messagesEffect } from "../../../src/analyses/simple/messages"
import { CodeMaatService } from "../../../src/services/code-maat"

describe("messages analysis", () => {
  const cannedData = [{ entity: "fix bug", matches: 3 }]
  const TestLayer = Layer.succeed(CodeMaatService, {
    runAnalysis: () => Effect.succeed(cannedData),
  })

  test("returns Analysis with JSON data by default", async () => {
    const result = await Effect.runPromise(
      messagesEffect({ gitLogPath: "/path/log", expressionToMatch: "fix" }).pipe(Effect.provide(TestLayer))
    )
    expect(result.metadata.analysisName).toBe("messages")
    expect(result.metadata.format).toBe("json")
    expect(result.data).toEqual(cannedData)
  })

  test("returns Analysis with CSV data when format=csv", async () => {
    const result = await Effect.runPromise(
      messagesEffect({ gitLogPath: "/path/log", expressionToMatch: "fix", format: "csv" }).pipe(Effect.provide(TestLayer))
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
      messagesEffect({ gitLogPath: "/path/log", expressionToMatch: "fix", vcsType: "git2" }).pipe(Effect.provide(SpyLayer))
    )
    expect(capturedOptions).toEqual(expect.objectContaining({ analysis: "messages", versionControl: "git2" }))
  })

  test("fails when expressionToMatch is not provided", async () => {
    const result = await Effect.runPromise(
      messagesEffect({ gitLogPath: "/path/log" }).pipe(
        Effect.provide(TestLayer),
        Effect.flip
      )
    )
    expect(result._tag).toBe("FormatError")
    expect((result as { message: string }).message).toContain("expressionToMatch")
  })
})
