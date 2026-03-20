import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { complexityHotspotsEffect } from "../../../src/analyses/aggregated/complexity-hotspots"
import { CodeMaatService } from "../../../src/services/code-maat"
import { LizardService } from "../../../src/services/lizard"

describe("complexity hotspots analysis", () => {
  const cannedChurn = [
    { entity: "/src/foo.ts", nRevs: 20 },
    { entity: "/src/bar.ts", nRevs: 8 },
    { entity: "/src/orphan.ts", nRevs: 3 },
  ]

  // Lizard returns string values from CSV parsing (unknown[])
  const cannedComplexity = [
    {
      nloc: "100", cyclomatic_complexity: "15", token_count: "500",
      parameters: "3", length: "100", location: "fn@1-100@/src/foo.ts",
      file: "/src/foo.ts", function: "fn", long_name: "fn(a,b,c)",
      start_line: "1", end_line: "100",
    },
    {
      nloc: "20", cyclomatic_complexity: "5", token_count: "80",
      parameters: "0", length: "20", location: "helper@101-120@/src/foo.ts",
      file: "/src/foo.ts", function: "helper", long_name: "helper()",
      start_line: "101", end_line: "120",
    },
    {
      nloc: "30", cyclomatic_complexity: "12", token_count: "150",
      parameters: "1", length: "30", location: "process@1-30@/src/bar.ts",
      file: "/src/bar.ts", function: "process", long_name: "process(x)",
      start_line: "1", end_line: "30",
    },
  ]

  const TestLayer = Layer.merge(
    Layer.succeed(CodeMaatService, {
      runAnalysis: () => Effect.succeed(cannedChurn),
    }),
    Layer.succeed(LizardService, {
      analyze: () => Effect.succeed(cannedComplexity),
    }),
  )

  test("produces hotspots from inner join of churn and complexity", async () => {
    const result = await Effect.runPromise(
      complexityHotspotsEffect({
        gitLogPath: "/path/log",
        sourceDir: "/path/src",
      }).pipe(Effect.provide(TestLayer))
    )
    expect(result.metadata.analysisName).toBe("complexity-hotspots")
    expect(result.metadata.format).toBe("json")
    // foo.ts and bar.ts match; orphan.ts has no complexity data
    expect(result.data).toHaveLength(2)
    expect(result.data).toContainEqual({
      entity: "/src/foo.ts", nRevs: 20, cyclomaticComplexity: 15,
    })
    expect(result.data).toContainEqual({
      entity: "/src/bar.ts", nRevs: 8, cyclomaticComplexity: 12,
    })
  })

  test("supports CSV output", async () => {
    const result = await Effect.runPromise(
      complexityHotspotsEffect({
        gitLogPath: "/path/log",
        sourceDir: "/path/src",
        format: "csv",
      }).pipe(Effect.provide(TestLayer))
    )
    expect(result.metadata.format).toBe("csv")
    expect(typeof result.data).toBe("string")
    expect(result.data).toContain("entity,nRevs,cyclomaticComplexity")
  })

  test("extracts churn and complexity in parallel", async () => {
    let churnCalled = false
    let complexityCalled = false
    const SpyLayer = Layer.merge(
      Layer.succeed(CodeMaatService, {
        runAnalysis: () => { churnCalled = true; return Effect.succeed(cannedChurn) },
      }),
      Layer.succeed(LizardService, {
        analyze: () => { complexityCalled = true; return Effect.succeed(cannedComplexity) },
      }),
    )
    await Effect.runPromise(
      complexityHotspotsEffect({ gitLogPath: "/path/log", sourceDir: "/path/src" }).pipe(Effect.provide(SpyLayer))
    )
    expect(churnCalled).toBe(true)
    expect(complexityCalled).toBe(true)
  })
})
