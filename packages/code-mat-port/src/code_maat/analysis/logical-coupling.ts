import type { AnalysisOptions, VCSEntry } from "../types";
import { asCoChangingModules, couplingFrequencies, moduleByRevs } from "./coupling-algos";

export type CouplingResult = {
  entity: string;
  coupled: string;
  degree: number;
  averageRevs: number;
};

/**
 * Groups entries by revision and returns entity groups, filtered by maxChangesetSize.
 * This mirrors co-changing-by-revision in coupling_algos.clj.
 */
function entitiesByRevisionFiltered(entries: VCSEntry[], maxChangesetSize: number): VCSEntry[][] {
  const byRev = new Map<string | number, VCSEntry[]>();
  for (const entry of entries) {
    const key = entry.rev;
    if (!byRev.has(key)) {
      byRev.set(key, []);
    }
    byRev.get(key)!.push(entry);
  }
  return Array.from(byRev.values()).filter((group) => group.length <= maxChangesetSize);
}

/**
 * Calculates the degree of logical coupling for all module pairs.
 *
 * Formula: degree = floor((sharedRevisions / average(revsA, revsB)) * 100)
 * averageRevs = ceil(average(revsA, revsB))
 *
 * Returns results sorted by degree descending, then entity name.
 */
export function byDegree(entries: VCSEntry[], options: AnalysisOptions): CouplingResult[] {
  const { minRevs, minSharedRevs, minCoupling, maxCoupling, maxChangesetSize } = options;

  // Filter revisions by changeset size, then compute co-changing pairs
  const filteredGroups = entitiesByRevisionFiltered(entries, maxChangesetSize);
  const coChanging = asCoChangingModules(filteredGroups.flat());

  const moduleRevs = moduleByRevs(coChanging);
  const coupling = couplingFrequencies(coChanging);

  const results: CouplingResult[] = [];

  for (const [[entityA, entityB], sharedRevs] of coupling) {
    if (sharedRevs < minSharedRevs) continue;

    const revsA = moduleRevs[entityA] ?? 0;
    const revsB = moduleRevs[entityB] ?? 0;
    const avg = (revsA + revsB) / 2;
    const averageRevs = Math.ceil(avg);

    if (averageRevs < minRevs) continue;

    const degree = Math.floor((sharedRevs / avg) * 100);

    if (degree < minCoupling) continue;
    if (Math.floor(degree) > maxCoupling) continue;

    results.push({ entity: entityA, coupled: entityB, degree, averageRevs });
  }

  return results.sort((a, b) => {
    if (b.degree !== a.degree) return b.degree - a.degree;
    return a.entity.localeCompare(b.entity);
  });
}
