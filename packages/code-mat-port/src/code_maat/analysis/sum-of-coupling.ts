import type { VCSEntry, AnalysisOptions } from "../types";

export type SocResult = {
  entity: string;
  soc: number;
};

/**
 * Groups VCS entries by revision and returns the entity names for each revision.
 */
function entitiesByRevision(entries: VCSEntry[]): string[][] {
  const byRev = new Map<string | number, string[]>();
  for (const entry of entries) {
    const key = entry.rev;
    if (!byRev.has(key)) {
      byRev.set(key, []);
    }
    byRev.get(key)!.push(entry.entity);
  }
  return Array.from(byRev.values());
}

/**
 * For a list of entities in a single revision, returns pairs of [entity, nCouples]
 * where nCouples = (count of entities in revision) - 1.
 * This represents how many partners each entity has in that revision.
 */
function countedEntities(entitiesInRev: string[]): [string, number][] {
  const nCouples = entitiesInRev.length - 1;
  return entitiesInRev.map(entity => [entity, nCouples]);
}

/**
 * Returns a flat list of [entity, nCouples] pairs across all revisions.
 */
function entitiesWithCouplingCountByRev(entries: VCSEntry[]): [string, number][] {
  const revGroups = entitiesByRevision(entries);
  return revGroups.flatMap(countedEntities);
}

/**
 * Calculates the Sum of Coupling (SoC) for each entity in the dataset.
 *
 * The SoC for an entity is the total number of co-change partners it has
 * across all revisions. Only entities with SoC > minRevs are included.
 *
 * Returns results as [entity, soc] pairs sorted by soc descending.
 */
export function asSoc(
  entries: VCSEntry[],
  options: Pick<AnalysisOptions, "minRevs">
): [string, number][] {
  const { minRevs } = options;

  const entityCouplings = entitiesWithCouplingCountByRev(entries);

  const sumByEntity: Record<string, number> = {};
  for (const [entity, n] of entityCouplings) {
    sumByEntity[entity] = (sumByEntity[entity] ?? 0) + n;
  }

  return Object.entries(sumByEntity)
    .filter(([, n]) => n > minRevs)
    .sort(([entityA, nA], [entityB, nB]) => {
      if (nB !== nA) return nB - nA;
      return entityA.localeCompare(entityB);
    });
}

/**
 * Calculates the sum of coupling and returns structured results
 * sorted by soc descending.
 */
export function byDegree(
  entries: VCSEntry[],
  options: Pick<AnalysisOptions, "minRevs">
): SocResult[] {
  return asSoc(entries, options).map(([entity, soc]) => ({ entity, soc }));
}
