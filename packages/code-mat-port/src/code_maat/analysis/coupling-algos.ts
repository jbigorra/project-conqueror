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
    a <= b ? ([a, b] as [string, string]) : ([b, a] as [string, string])
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
 * Groups entries by revision and returns all co-changing module pairs for each revision.
 * Identity pairs (e.g. ["A","A"]) are kept — they're used to compute total revision counts.
 * Mirrors `co-changing-by-revision` in Clojure.
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
 * Returns the count of how many times each non-identity pair co-changed across all revisions.
 * Input is the output of `asCoChangingModules` (or co-changing-by-revision).
 * Returns array of [[entity1, entity2], count] sorted by insertion order.
 */
export function couplingFrequencies(
  allCoChanging: [string, string][][]
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

  return Array.from(counts.entries()).map(([key, count]) => [
    pairMap.get(key)!,
    count,
  ]);
}

/**
 * Returns a map of entity -> total number of revisions it appeared in.
 * Uses the identity pairs in co-changing data to reconstruct which modules
 * were in each revision, then counts per module.
 *
 * Mirrors `module-by-revs` in Clojure:
 *   (mapcat modules-in-one-rev all-co-changing) -> frequencies
 * where `modules-in-one-rev` is (comp distinct flatten)
 */
export function moduleByRevs(
  allCoChanging: [string, string][][]
): Record<string, number> {
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
