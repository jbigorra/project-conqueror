import type { AnalysisOptions, VCSEntry } from "../types";

export type EntityRevCount = { entity: string; nRevs: number };

export function all(entries: VCSEntry[]): string[] {
  return [...new Set(entries.map((e) => e.entity))];
}

export function allRevisions(entries: VCSEntry[]): (string | number)[] {
  return [...new Set(entries.map((e) => e.rev))];
}

export function byRevision(entries: VCSEntry[], _options: AnalysisOptions): EntityRevCount[] {
  const groups: Record<string, number> = {};
  for (const entry of entries) {
    groups[entry.entity] = (groups[entry.entity] ?? 0) + 1;
  }
  return Object.entries(groups)
    .map(([entity, nRevs]) => ({ entity, nRevs }))
    .sort((a, b) => b.nRevs - a.nRevs);
}

export function revisionsOf(entity: string, byRevisionDs: EntityRevCount[]): number {
  return byRevisionDs.find((e) => e.entity === entity)?.nRevs ?? 0;
}
