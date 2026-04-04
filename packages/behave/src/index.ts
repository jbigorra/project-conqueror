// New API — analyses
export { complexityHotspots } from "./analyses/aggregated/complexity-hotspots";
export * as simple from "./analyses/simple";
export { CodeMaatError, FormatError, LizardError } from "./errors";
// New facade
export { Behave } from "./behave";
// Legacy (deprecated)
export { AnalysisOptions, default } from "./legacy/index";
export { Behave as LegacyBehave } from "./legacy/index";
export type { ComplexityHotspot } from "./pipeline/transform/merge-by-entity";
// New API — types for consumers
export type { Analysis, AnalysisMetadata } from "./schemas/analysis";
// Analysis record types — for consumers that need typed analysis results
export type {
  AbsChurn,
  Author,
  AuthorChurn,
  CodeAge,
  Communication,
  Coupling,
  EntityChurn,
  EntityEffort,
  EntityOwnership,
  Fragmentation,
  MainDev,
  MainDevByRevs,
  MessageEntry,
  RefactoringMainDev,
  Revision,
  Soc,
  SummaryEntry,
} from "./schemas/code-maat";
export type {
  ComplexityHotspotsInput,
  OutputFormat,
  SimpleAnalysisInput,
} from "./types";
