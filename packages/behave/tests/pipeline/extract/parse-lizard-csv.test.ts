import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { parseLizardCsv } from "../../../src/pipeline/extract/parse-lizard-csv"

describe("parseLizardCsv", () => {
  test("parses valid CSV string into record array", async () => {
    const csv = "nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line\n" +
      '5,3,43,1,5,"constructor@12-16@foo.ts","/path/foo.ts","constructor","constructor(args)",12,16\n'
    const result = await Effect.runPromise(parseLizardCsv(csv))
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(expect.objectContaining({ nloc: "5", cyclomatic_complexity: "3", file: "/path/foo.ts" }))
  })
  test("returns empty array for headers-only CSV", async () => {
    const csv = "nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line\n"
    const result = await Effect.runPromise(parseLizardCsv(csv))
    expect(result).toEqual([])
  })
  test("fails with LizardError for malformed CSV", async () => {
    const result = await Effect.runPromiseExit(parseLizardCsv(""))
    expect(result._tag).toBe("Failure")
  })
})
