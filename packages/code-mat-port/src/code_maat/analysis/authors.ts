import type { AnalysisOptions, VCSEntry } from "../types";

/**
 * Returns the set of all unique authors across all VCS entries.
 *
 * @param ds - Array of parsed VCS log entries.
 * @returns A `Set` of author names/emails found anywhere in the log.
 *
 * @example
 * const entries = [
 *   { author: "alice", entity: "foo.ts", rev: "a1" },
 *   { author: "bob",   entity: "bar.ts", rev: "a2" },
 *   { author: "alice", entity: "baz.ts", rev: "a3" },
 * ];
 * all(entries); // Set { "alice", "bob" }
 */
export function all(ds: VCSEntry[]): Set<string> {
  return new Set(ds.map((r) => r.author));
}

/**
 * Returns the set of unique authors who changed a specific entity (file/module).
 *
 * @param ds - Array of parsed VCS log entries.
 * @param entity - The file path or entity name to filter by (exact match).
 * @returns A `Set` of author names who committed to that entity.
 *
 * @example
 * ofModule(entries, "src/foo.ts"); // Set { "alice" }
 */
export function ofModule(ds: VCSEntry[], entity: string): Set<string> {
  return new Set(ds.filter((r) => r.entity === entity).map((r) => r.author));
}

/**
 * Counts distinct authors and total revisions per entity, sorted by author count.
 *
 * Entities with many authors are potential knowledge-silos or high-churn hotspots.
 * The `_options` parameter is accepted for API consistency but unused.
 *
 * @param ds - Array of parsed VCS log entries.
 * @param _options - Analysis options (unused, accepted for API consistency).
 * @param sort - Sort direction: `"desc"` (default) puts highest author count first.
 * @returns Array of `{ entity, nAuthors, nRevs }` records.
 *
 * @example
 * byCount(entries, defaultOptions);
 * // [
 * //   { entity: "src/core.ts", nAuthors: 5, nRevs: 42 },
 * //   { entity: "src/util.ts", nAuthors: 1, nRevs: 3  },
 * // ]
 */
export function byCount(
  ds: VCSEntry[],
  _options: AnalysisOptions,
  sort: "asc" | "desc" = "desc",
): Array<{ entity: string; nAuthors: number; nRevs: number }> {
  const entityData = new Map<string, { authors: Set<string>; revs: number }>();

  for (const row of ds) {
    let data = entityData.get(row.entity);
    if (!data) {
      data = { authors: new Set<string>(), revs: 0 };
      entityData.set(row.entity, data);
    }
    data.authors.add(row.author);
    data.revs += 1;
  }

  return [...entityData.entries()]
    .map(([entity, { authors, revs }]) => ({
      entity,
      nAuthors: authors.size,
      nRevs: revs,
    }))
    .sort((a, b) => (sort === "desc" ? b.nAuthors - a.nAuthors : a.nAuthors - b.nAuthors));
}
