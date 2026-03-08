import type { AnalysisOptions, VCSEntry } from "../types";

/** One row of the sum-of-coupling analysis: an entity and its total co-change partner count. */
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
  return entitiesInRev.map((entity) => [entity, nCouples]);
}

/**
 * Returns a flat list of [entity, nCouples] pairs across all revisions.
 */
function entitiesWithCouplingCountByRev(entries: VCSEntry[]): [string, number][] {
  const revGroups = entitiesByRevision(entries);
  return revGroups.flatMap(countedEntities);
}

/**
 * Calculates the Sum of Coupling (SoC) for each entity in the dataset as raw tuples.
 *
 * The SoC for an entity is the cumulative count of co-change partners across all
 * revisions. For each revision containing N entities, every entity in that revision
 * accumulates N-1 to its SoC (one for each partner). Entities whose total SoC does
 * not exceed `minRevs` are filtered out. Results are sorted descending by SoC; ties
 * are broken by entity name ascending. See `byDegree` for the structured-object version.
 *
 * @param entries - VCS log entries. Only `rev` and `entity` fields are used.
 * @param options - `{ minRevs }` — minimum SoC value (exclusive) an entity must reach
 *   to be included in the result.
 * @returns Array of `[entity, soc]` tuples sorted descending by `soc`. Entities whose
 *   SoC is ≤ `minRevs` are excluded.
 *
 * @example
 * asSoc(entries, { minRevs: 1 });
 * // [
 * //   ["A", 3],
 * //   ["B", 3],
 * //   ["C", 2],
 * // ]
 */
export function asSoc(
  entries: VCSEntry[],
  options: Pick<AnalysisOptions, "minRevs">,
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
 * Calculates the Sum of Coupling (SoC) for each entity and returns structured result objects.
 *
 * Delegates to `asSoc` for computation and threshold filtering, then maps the
 * `[entity, soc]` tuples into `SocResult` objects for a consistent API shape across
 * analyses. Results are sorted descending by SoC; ties are broken by entity name ascending.
 *
 * @param entries - VCS log entries. Only `rev` and `entity` fields are used.
 * @param options - `{ minRevs }` — minimum SoC value (exclusive) an entity must reach
 *   to appear in the result.
 * @returns Array of `SocResult` sorted descending by `soc`. Each record contains
 *   `entity` (file path) and `soc` (total co-change partner count).
 *
 * @example
 * byDegree(entries, { minRevs: 1 });
 * // [
 * //   { entity: "A", soc: 3 },
 * //   { entity: "B", soc: 3 },
 * //   { entity: "C", soc: 2 },
 * // ]
 */
export function byDegree(
  entries: VCSEntry[],
  options: Pick<AnalysisOptions, "minRevs">,
): SocResult[] {
  return asSoc(entries, options).map(([entity, soc]) => ({ entity, soc }));
}
