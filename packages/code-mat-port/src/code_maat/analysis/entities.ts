import type { AnalysisOptions, VCSEntry } from "../types";

/** One row of the by-revision entity analysis: an entity and the number of revisions it was changed in. */
export type EntityRevCount = { entity: string; nRevs: number };

/**
 * Returns a deduplicated list of all entity names present in the VCS log.
 *
 * Iterates over every entry and collects unique entity paths using a Set,
 * preserving first-occurrence order. Used as a foundation for summary statistics
 * and any analysis that needs to enumerate the full set of changed modules.
 *
 * @param entries - VCS log entries. Only the `entity` field is used.
 * @returns Array of unique entity names in first-occurrence order.
 *
 * @example
 * all([{ entity: "A", rev: 1, author: "apt" }, { entity: "B", rev: 1, author: "apt" }, { entity: "A", rev: 2, author: "jt" }]);
 * // ["A", "B"]
 */
export function all(entries: VCSEntry[]): string[] {
  return [...new Set(entries.map((e) => e.entity))];
}

/**
 * Returns a deduplicated list of all revision identifiers present in the VCS log.
 *
 * Collects unique `rev` values using a Set, preserving first-occurrence order.
 * Used in summary analysis to count distinct commits (e.g. `number-of-commits`).
 *
 * @param entries - VCS log entries. Only the `rev` field is used.
 * @returns Array of unique revision identifiers (string or number) in first-occurrence order.
 *
 * @example
 * allRevisions([{ entity: "A", rev: 1, author: "apt" }, { entity: "B", rev: 1, author: "apt" }, { entity: "A", rev: 2, author: "jt" }]);
 * // [1, 2]
 */
export function allRevisions(entries: VCSEntry[]): (string | number)[] {
  return [...new Set(entries.map((e) => e.rev))];
}

/**
 * Counts how many revisions each entity was changed in and sorts by activity.
 *
 * Groups entries by entity and counts occurrences. The result is sorted descending
 * by revision count so the most actively changed entities appear first. This is the
 * primary hotspot analysis and drives the logical-coupling pipeline.
 *
 * @param entries - VCS log entries. Only the `entity` field is used.
 * @param _options - Analysis options (unused here; present for API consistency).
 * @returns Array of `EntityRevCount` sorted descending by `nRevs`. Each record contains
 *   `entity` (file path) and `nRevs` (number of revisions it appeared in).
 *
 * @example
 * byRevision(vcs, options);
 * // [
 * //   { entity: "A", nRevs: 3 },
 * //   { entity: "B", nRevs: 1 },
 * // ]
 */
export function byRevision(entries: VCSEntry[], _options: AnalysisOptions): EntityRevCount[] {
  const groups: Record<string, number> = {};
  for (const entry of entries) {
    groups[entry.entity] = (groups[entry.entity] ?? 0) + 1;
  }
  return Object.entries(groups)
    .map(([entity, nRevs]) => ({ entity, nRevs }))
    .sort((a, b) => b.nRevs - a.nRevs);
}

/**
 * Looks up the revision count for a single entity in a pre-computed `byRevision` result.
 *
 * Convenience accessor that avoids manual `Array.find` at call sites. Returns 0 when
 * the entity is not found, which simplifies conditional logic in the coupling pipeline.
 *
 * @param entity - The entity name (file path) to look up.
 * @param byRevisionDs - The array produced by `byRevision`.
 * @returns The revision count for `entity`, or 0 if the entity is not in the dataset.
 *
 * @example
 * revisionsOf("A", byRevision(vcs, options));
 * // 3
 */
export function revisionsOf(entity: string, byRevisionDs: EntityRevCount[]): number {
  return byRevisionDs.find((e) => e.entity === entity)?.nRevs ?? 0;
}
