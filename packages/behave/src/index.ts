// New API — analyses
export { complexityHotspots } from "./analyses/aggregated/complexity-hotspots"
export * as simple from "./analyses/simple"

// New API — types for consumers
export type { Analysis, AnalysisMetadata } from "./schemas/analysis"
export type { OutputFormat, ComplexityHotspotsInput, SimpleAnalysisInput } from "./types"
export { CodeMaatError, LizardError, FormatError } from "./errors"

// Legacy (deprecated) — existing consumers keep working
export { default, AnalysisOptions, Behave } from "./legacy/index"
