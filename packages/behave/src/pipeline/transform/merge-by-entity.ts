import type { Revision } from "../../schemas/code-maat";
import type { LizardFunctionMetric } from "../../schemas/lizard";

/** A file entity combining revision frequency with cyclomatic complexity. */
export type ComplexityHotspot = {
  /** Git-root-relative file path. */
  entity: string;
  /** Total number of revisions. */
  nRevs: number;
  /** Maximum cyclomatic complexity across all functions in the file. */
  cyclomaticComplexity: number;
  /** Total lines of code across all functions in the file. */
  linesOfCode: number;
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

/**
 * Merges revision data from code-maat with complexity data from lizard by matching entity paths.
 *
 * @param churn - Revision records from code-maat (git-root-relative paths).
 * @param complexity - Function-level metrics from lizard (absolute paths).
 * @returns Hotspots where both revision and complexity data exist for the same file.
 *
 * @example
 * ```ts
 * const hotspots = mergeByEntity(
 *   [{ entity: "src/app.ts", nRevs: 42 }],
 *   [{ file: "/home/user/project/src/app.ts", cyclomaticComplexity: 12, nloc: 150, ... }],
 * );
 * ```
 */
export const mergeByEntity = (
  churn: readonly Revision[],
  complexity: readonly LizardFunctionMetric[],
): ComplexityHotspot[] => {
  // Aggregate max complexity and sum LOC per file (using original lizard paths)
  const complexityByFile = new Map<string, number>();
  const locByFile = new Map<string, number>();
  for (const metric of complexity) {
    const currentCC = complexityByFile.get(metric.file) ?? 0;
    complexityByFile.set(metric.file, Math.max(currentCC, metric.cyclomaticComplexity));
    const currentLoc = locByFile.get(metric.file) ?? 0;
    locByFile.set(metric.file, currentLoc + metric.nloc);
  }

  const hotspots: ComplexityHotspot[] = [];
  for (const rev of churn) {
    // Find matching lizard file by suffix match
    let maxComplexity: number | undefined;
    let totalLoc: number | undefined;
    for (const [lizardFile, cc] of complexityByFile) {
      if (pathsMatch(rev.entity, lizardFile)) {
        maxComplexity = cc;
        totalLoc = locByFile.get(lizardFile);
        break;
      }
    }
    if (maxComplexity !== undefined && totalLoc !== undefined) {
      hotspots.push({
        entity: rev.entity,
        nRevs: rev.nRevs,
        cyclomaticComplexity: maxComplexity,
        linesOfCode: totalLoc,
      });
    }
  }
  return hotspots;
};
