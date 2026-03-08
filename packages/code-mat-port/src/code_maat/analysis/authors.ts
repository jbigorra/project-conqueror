import type { AnalysisOptions, VCSEntry } from "../types";

export function all(ds: VCSEntry[]): Set<string> {
  return new Set(ds.map((r) => r.author));
}

export function ofModule(ds: VCSEntry[], entity: string): Set<string> {
  return new Set(ds.filter((r) => r.entity === entity).map((r) => r.author));
}

export function byCount(
  ds: VCSEntry[],
  _options: AnalysisOptions,
  sort: "asc" | "desc" = "desc",
): Array<{ entity: string; nAuthors: number; nRevs: number }> {
  const entityData = new Map<string, { authors: Set<string>; revs: number }>();

  for (const row of ds) {
    if (!entityData.has(row.entity)) {
      entityData.set(row.entity, { authors: new Set(), revs: 0 });
    }
    const data = entityData.get(row.entity)!;
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
