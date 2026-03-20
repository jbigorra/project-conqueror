import { describe, expect, test } from "bun:test"
import { mergeByEntity } from "../../../src/pipeline/transform/merge-by-entity"
import type { Revision } from "../../../src/schemas/code-maat"
import type { LizardFunctionMetrics } from "../../../src/schemas/lizard"

describe("mergeByEntity", () => {
  test("inner joins churn and complexity by file/entity", () => {
    const churn: Revision[] = [
      { entity: "src/foo.ts", nRevs: 10 },
      { entity: "src/bar.ts", nRevs: 5 },
    ]
    const complexity: LizardFunctionMetrics = [
      { nloc: 50, cyclomaticComplexity: 8, tokenCount: 200, parameters: 2, length: 60, location: "foo@1-60@src/foo.ts", file: "src/foo.ts", functionName: "doThing", longName: "doThing(a)", startLine: 1, endLine: 60 },
    ]
    const result = mergeByEntity(churn, complexity)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ entity: "src/foo.ts", nRevs: 10, cyclomaticComplexity: 8 })
  })
  test("takes max cyclomatic complexity per file", () => {
    const churn: Revision[] = [{ entity: "src/foo.ts", nRevs: 10 }]
    const complexity: LizardFunctionMetrics = [
      { nloc: 10, cyclomaticComplexity: 3, tokenCount: 50, parameters: 1, length: 10, location: "a@1-10@src/foo.ts", file: "src/foo.ts", functionName: "a", longName: "a()", startLine: 1, endLine: 10 },
      { nloc: 30, cyclomaticComplexity: 12, tokenCount: 150, parameters: 3, length: 30, location: "b@11-40@src/foo.ts", file: "src/foo.ts", functionName: "b", longName: "b(x,y,z)", startLine: 11, endLine: 40 },
      { nloc: 5, cyclomaticComplexity: 1, tokenCount: 20, parameters: 0, length: 5, location: "c@41-45@src/foo.ts", file: "src/foo.ts", functionName: "c", longName: "c()", startLine: 41, endLine: 45 },
    ]
    const result = mergeByEntity(churn, complexity)
    expect(result).toHaveLength(1)
    expect(result[0].cyclomaticComplexity).toBe(12)
  })
  test("returns empty array when no entities match", () => {
    const churn: Revision[] = [{ entity: "src/foo.ts", nRevs: 10 }]
    const complexity: LizardFunctionMetrics = [
      { nloc: 10, cyclomaticComplexity: 5, tokenCount: 50, parameters: 1, length: 10, location: "x@1-10@src/other.ts", file: "src/other.ts", functionName: "x", longName: "x()", startLine: 1, endLine: 10 },
    ]
    const result = mergeByEntity(churn, complexity)
    expect(result).toEqual([])
  })
  test("returns empty array when both inputs are empty", () => {
    const result = mergeByEntity([], [])
    expect(result).toEqual([])
  })
})
