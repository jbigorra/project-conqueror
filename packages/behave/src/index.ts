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
// Analysis record types — for consumers that need typed analysis results
export type {
	Revision,
	Author,
	Coupling,
	Soc,
	SummaryEntry,
	AbsChurn,
	AuthorChurn,
	EntityChurn,
	EntityOwnership,
	MainDev,
	RefactoringMainDev,
	EntityEffort,
	MainDevByRevs,
	Fragmentation,
	Communication,
	MessageEntry,
	CodeAge,
} from "./schemas/code-maat";
export type { ComplexityHotspot } from "./pipeline/transform/merge-by-entity";
