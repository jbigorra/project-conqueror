import type { Revision } from "../../schemas/code-maat";
import type { LizardFunctionMetric } from "../../schemas/lizard";

export type ComplexityHotspot = {
  entity: string;
  nRevs: number;
  cyclomaticComplexity: number;
};

/**
 * Finds the suffix of `absolutePath` that matches `relativePath`.
 * Code-maat returns git-root-relative paths (e.g. "src/foo.ts"),
 * while lizard returns absolute paths (e.g. "/home/user/project/src/foo.ts").
 * We match by checking if the absolute path ends with the relative path.
 */
const pathsMatch = (relativePath: string, absolutePath: string): boolean => {
  if (relativePath === absolutePath) return true;
  return absolutePath.endsWith(`/${relativePath}`);
};

export const mergeByEntity = (
  churn: readonly Revision[],
  complexity: readonly LizardFunctionMetric[],
): ComplexityHotspot[] => {
  // Aggregate max complexity per file (using original lizard paths)
  const complexityByFile = new Map<string, number>();
  for (const metric of complexity) {
    const current = complexityByFile.get(metric.file) ?? 0;
    complexityByFile.set(metric.file, Math.max(current, metric.cyclomaticComplexity));
  }

  const hotspots: ComplexityHotspot[] = [];
  for (const rev of churn) {
    // Find matching lizard file by suffix match
    let maxComplexity: number | undefined;
    for (const [lizardFile, cc] of complexityByFile) {
      if (pathsMatch(rev.entity, lizardFile)) {
        maxComplexity = cc;
        break;
      }
    }
    if (maxComplexity !== undefined) {
      hotspots.push({
        entity: rev.entity,
        nRevs: rev.nRevs,
        cyclomaticComplexity: maxComplexity,
      });
    }
  }
  return hotspots;
};
