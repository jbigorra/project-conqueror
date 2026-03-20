import type { OutputFormat } from "../types"

export type AnalysisMetadata = {
  analysisName: string
  timestamp: Date
  parameters: Record<string, unknown>
  format: OutputFormat
}

export type Analysis<T> =
  | { metadata: AnalysisMetadata & { format: "json" }; data: T[] }
  | { metadata: AnalysisMetadata & { format: "csv" }; data: string }
