import type { AnalysisOptions, VCSEntry } from "../types";
import { asCoChangingModules, couplingFrequencies, moduleByRevs } from "./coupling-algos";

/** One row of the logical-coupling analysis: two entities that tend to change together and their coupling metrics. */
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
 * Calculates the degree of logical coupling for all co-changing module pairs.
 *
 * Two entities are logically coupled when they are frequently changed together. For each
 * pair the coupling degree is `floor((sharedRevisions / average(revsA, revsB)) * 100)`.
 * Revisions containing more entries than `maxChangesetSize` are excluded from the
 * analysis because large bulk commits add noise. Pairs below the `minSharedRevs`,
 * `minRevs`, `minCoupling`, or above `maxCoupling` thresholds are filtered out.
 * Results are sorted descending by degree; ties are broken by entity name ascending.
 *
 * @param entries - VCS log entries. Only `rev` and `entity` fields are used.
 * @param options - Thresholds controlling which pairs are returned:
 *   `minRevs` (minimum average revision count per entity),
 *   `minSharedRevs` (minimum co-change count),
 *   `minCoupling` (minimum degree percentage),
 *   `maxCoupling` (maximum degree percentage),
 *   `maxChangesetSize` (revisions with more entries than this are excluded).
 * @returns Array of `CouplingResult` sorted descending by `degree`. Each record contains
 *   `entity`, `coupled` (the co-changing partner), `degree` (0–100 integer), and
 *   `averageRevs` (ceiling of the average revision count across both entities).
 *
 * @example
 * byDegree(entries, { minRevs: 5, minSharedRevs: 5, minCoupling: 30, maxCoupling: 100, maxChangesetSize: 30 });
 * // [
 * //   { entity: "A", coupled: "B", degree: 66, averageRevs: 6 },
 * // ]
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
    if (degree > maxCoupling) continue;

    results.push({ entity: entityA, coupled: entityB, degree, averageRevs });
  }

  return results.sort((a, b) => {
    if (b.degree !== a.degree) return b.degree - a.degree;
    return a.entity.localeCompare(b.entity);
  });
}
