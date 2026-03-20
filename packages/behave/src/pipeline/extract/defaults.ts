import type { AnalysisOptions } from "code-mat-port"

export const DEFAULT_OPTIONS: AnalysisOptions = {
  minRevs: 5, minSharedRevs: 5, minCoupling: 30, maxCoupling: 100, maxChangesetSize: 30,
}

export const withDefaults = (options?: Partial<AnalysisOptions>): AnalysisOptions => ({
  ...DEFAULT_OPTIONS, ...options,
})
