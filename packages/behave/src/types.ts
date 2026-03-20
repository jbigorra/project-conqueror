import type { AnalysisOptions } from "code-mat-port"

export type OutputFormat = "json" | "csv"

export type BaseAnalysisInput = {
  format?: OutputFormat
}

export type SimpleAnalysisInput = BaseAnalysisInput & {
  gitLogPath: string
  vcsType?: string
  options?: Partial<AnalysisOptions>
  ageTimeNow?: string
  expressionToMatch?: string
  group?: string
  teamMapFile?: string
  temporalPeriod?: string
}

export type ComplexityHotspotsInput = BaseAnalysisInput & {
  gitLogPath: string
  sourceDir: string
  vcsType?: string
  options?: Partial<AnalysisOptions>
}
