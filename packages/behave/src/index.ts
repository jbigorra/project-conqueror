// New API — analyses
export { complexityHotspots } from "./analyses/aggregated/complexity-hotspots";
export * as simple from "./analyses/simple";
export { CodeMaatError, FormatError, LizardError } from "./errors";
// Legacy (deprecated) — existing consumers keep working
export { AnalysisOptions, Behave, default } from "./legacy/index";
// New API — types for consumers
export type { Analysis, AnalysisMetadata } from "./schemas/analysis";
export type {
	ComplexityHotspotsInput,
	OutputFormat,
	SimpleAnalysisInput,
} from "./types";
