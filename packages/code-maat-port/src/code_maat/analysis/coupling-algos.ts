import type { VCSEntry } from "../types";

/**
 * Generates all 2-element selections (with repetition) from an array.
 * This mirrors Clojure's combo/selections with size 2.
 * e.g. ["A","B","C"] -> [["A","A"],["A","B"],["A","C"],["B","A"],["B","B"],["B","C"],["C","A"],["C","B"],["C","C"]]
 */
function selections2(items: string[]): [string, string][] {
  const result: [string, string][] = [];
  for (const a of items) {
    for (const b of items) {
      result.push([a, b]);
    }
  }
  return result;
}

/**
 * Sorts pairs alphabetically and removes duplicates (mirrors `drop-mirrored-modules`).
 * e.g. [["B","A"],["A","B"]] -> [["A","B"]]
 * Identity pairs like ["A","A"] are kept.
 */
function dropMirroredModules(pairs: [string, string][]): [string, string][] {
  const sorted = pairs.map(([a, b]) =>
    a <= b ? ([a, b] as [string, string]) : ([b, a] as [string, string]),
  );
  const seen = new Set<string>();
  const result: [string, string][] = [];
  for (const pair of sorted) {
    const key = `${pair[0]}\0${pair[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(pair);
    }
  }
  return result;
}

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
 * For a list of entities in a single revision, returns all pairs (including identity pairs).
 * Mirrors `as-co-changing-modules` in Clojure:
 *   (combo/selections entities 2) -> drop-mirrored-modules
 */
function asCoChangingModulesForRevision(entities: string[]): [string, string][] {
  return dropMirroredModules(selections2(entities));
}

/**
 * Groups VCS entries by revision and returns all co-changing module pairs for each revision.
 *
 * For every revision, the entities touched are collected and all 2-element selections
 * (with repetition) are generated, sorted alphabetically, and de-duplicated. Identity
 * pairs such as `["A","A"]` are intentionally kept because they are used downstream to
 * reconstruct how many revisions each module appeared in (see `moduleByRevs`). Mirrors
 * `co-changing-by-revision` in Clojure.
 *
 * @param entries - VCS log entries. Only `rev` and `entity` fields are used.
 * @returns A 2-D array where each inner array is the list of sorted-unique pairs for one
 *   revision. E.g. for entities `["A","B"]`, the inner array is `[["A","A"],["A","B"],["B","B"]]`.
 *
 * @example
 * asCoChangingModules([{ entity: "A", rev: 1, author: "a" }, { entity: "B", rev: 1, author: "a" }]);
 * // [ [["A","A"], ["A","B"], ["B","B"]] ]
 */
export function asCoChangingModules(entries: VCSEntry[]): [string, string][][] {
  const revGroups = entitiesByRevision(entries);
  return revGroups.map(asCoChangingModulesForRevision);
}

/**
 * Drops identity pairs (where both elements are equal).
 * Mirrors `drop-duplicates` in Clojure: (remove #(= % (reverse %)) entities)
 */
function dropDuplicates(pairs: [string, string][]): [string, string][] {
  return pairs.filter(([a, b]) => a !== b);
}

/**
 * Counts how many times each non-identity entity pair co-changed across all revisions.
 *
 * Flattens the 2-D co-changing pairs structure produced by `asCoChangingModules`, strips
 * identity pairs (where both elements are equal), then tallies occurrences of each
 * remaining pair. Insertion order within the output is stable and matches the order
 * pairs are first encountered. Used as an intermediate step before computing coupling
 * degree in `logical-coupling.ts`.
 *
 * @param allCoChanging - Output of `asCoChangingModules`: a 2-D array of pair lists, one
 *   inner array per revision. Identity pairs (e.g. `["A","A"]`) present in the input are
 *   filtered out before counting.
 * @returns Array of `[[entity1, entity2], count]` tuples in insertion order. Each tuple
 *   records a distinct co-changed pair and the number of revisions they appeared together.
 *
 * @example
 * couplingFrequencies([ [["A","A"],["A","B"],["B","B"]], [["A","A"],["A","B"],["B","B"]] ]);
 * // [ [["A","B"], 2] ]
 */
export function couplingFrequencies(
  allCoChanging: [string, string][][],
): [[string, string], number][] {
  const flat = allCoChanging.flat();
  const nonIdentity = dropDuplicates(flat);

  const counts = new Map<string, number>();
  const pairMap = new Map<string, [string, string]>();

  for (const pair of nonIdentity) {
    const key = `${pair[0]}\0${pair[1]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!pairMap.has(key)) {
      pairMap.set(key, pair);
    }
  }

  return Array.from(counts.entries()).map(([key, count]) => [pairMap.get(key)!, count]);
}

/**
 * Returns a map of entity to the total number of revisions it appeared in.
 *
 * Reconstructs per-revision entity sets by flattening each inner pair list and
 * de-duplicating. Each entity is then incremented once per revision. The identity
 * pairs kept by `asCoChangingModules` are what make this reconstruction possible —
 * they encode which modules were present in each revision. Mirrors `module-by-revs`
 * in Clojure (`(mapcat (comp distinct flatten) all-co-changing)` → frequencies).
 *
 * @param allCoChanging - Output of `asCoChangingModules`: a 2-D array of pair lists, one
 *   inner array per revision, including identity pairs.
 * @returns A plain object mapping each entity name to its total revision count.
 *   E.g. `{ "A": 2, "B": 2, "C": 1 }`.
 *
 * @example
 * moduleByRevs([ [["A","A"],["A","B"],["B","B"]] ]);
 * // { A: 1, B: 1 }
 */
export function moduleByRevs(allCoChanging: [string, string][][]): Record<string, number> {
  const result: Record<string, number> = {};

  for (const revPairs of allCoChanging) {
    // flatten all pair elements and take distinct for this revision
    const allEntities = revPairs.flat();
    const distinct = [...new Set(allEntities)];
    for (const entity of distinct) {
      result[entity] = (result[entity] ?? 0) + 1;
    }
  }

  return result;
}
