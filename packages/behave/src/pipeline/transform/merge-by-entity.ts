import type { Revision } from "../../schemas/code-maat"
import type { LizardFunctionMetrics } from "../../schemas/lizard"

export type ComplexityHotspot = {
  entity: string
  nRevs: number
  cyclomaticComplexity: number
}

export const mergeByEntity = (churn: Revision[], complexity: LizardFunctionMetrics): ComplexityHotspot[] => {
  const complexityByFile = new Map<string, number>()
  for (const metric of complexity) {
    const current = complexityByFile.get(metric.file) ?? 0
    complexityByFile.set(metric.file, Math.max(current, metric.cyclomaticComplexity))
  }
  const hotspots: ComplexityHotspot[] = []
  for (const rev of churn) {
    const maxComplexity = complexityByFile.get(rev.entity)
    if (maxComplexity !== undefined) {
      hotspots.push({ entity: rev.entity, nRevs: rev.nRevs, cyclomaticComplexity: maxComplexity })
    }
  }
  return hotspots
}
