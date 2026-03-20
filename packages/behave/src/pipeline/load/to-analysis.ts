import { Effect } from "effect"
import type { Analysis } from "../../schemas/analysis"
import type { OutputFormat } from "../../types"
import { FormatError } from "../../errors"
import { toCsv } from "./format"
import { extractParameters } from "./extract-parameters"

export const toAnalysis = <T>(
  analysisName: string,
  data: readonly T[],
  input: { format?: OutputFormat; [key: string]: unknown }
): Effect.Effect<Analysis<T>, FormatError> =>
  Effect.gen(function* () {
    const format = input.format ?? "json"
    const metadata = {
      analysisName,
      timestamp: new Date(),
      parameters: extractParameters(input),
      format,
    }
    if (format === "csv") {
      return { metadata: { ...metadata, format: "csv" as const }, data: yield* toCsv(data as readonly Record<string, unknown>[]) }
    }
    return { metadata: { ...metadata, format: "json" as const }, data }
  })
