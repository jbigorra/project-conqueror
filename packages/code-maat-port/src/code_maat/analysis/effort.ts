import type { VCSEntry } from "../types";
import { ratioCentiFloatPrecision } from "./math";

/** One row of the revisions-per-author analysis: how many revisions an author contributed to an entity. */
export type RevisionPerAuthor = {
  entity: string;
  author: string;
  authorRevs: number;
  totalRevs: number;
};

/** One row of the fragmentation analysis: the fractal value (fragmentation index) for an entity. */
export type EntityFragmentation = {
  entity: string;
  fractalValue: number;
  totalRevs: number;
};

/** One row of the main-developer-by-revisions analysis: the author who committed most to an entity. */
export type MainDeveloper = {
  entity: string;
  mainDev: string;
  added: number;
  totalAdded: number;
  ownership: number;
};

type AuthorRevs = {
  author: string;
  revs: number;
  totalRevs: number;
};

type EntityAuthorRevs = {
  entity: string;
  authorRevs: AuthorRevs[];
};

function compareEntities(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function groupByEntity(entries: VCSEntry[]): Map<string, VCSEntry[]> {
  const groups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const existing = groups.get(entry.entity) ?? [];
    existing.push(entry);
    groups.set(entry.entity, existing);
  }
  return groups;
}

function sumEffortByAuthor(entries: VCSEntry[]): AuthorRevs[] {
  const totalRevs = entries.length;
  const authorGroups = new Map<string, number>();
  for (const entry of entries) {
    authorGroups.set(entry.author, (authorGroups.get(entry.author) ?? 0) + 1);
  }
  return Array.from(authorGroups.entries()).map(([author, revs]) => ({
    author,
    revs,
    totalRevs,
  }));
}

function computeEntityAuthorRevs(entries: VCSEntry[]): EntityAuthorRevs[] {
  const entityGroups = groupByEntity(entries);
  const result: EntityAuthorRevs[] = [];
  for (const [entity, entityEntries] of entityGroups) {
    result.push({
      entity,
      authorRevs: sumEffortByAuthor(entityEntries),
    });
  }
  return result;
}

/**
 * Returns the revision contribution of each author for every entity in the dataset.
 *
 * Groups entries first by entity, then by author, and counts how many revisions each
 * author committed to that entity. The `totalRevs` field is the total number of revisions
 * for that entity (all authors combined). Sorting is ascending by entity name; within
 * each entity, authors are ordered descending by revision count.
 *
 * @param entries - VCS log entries. Only `entity`, `author`, and `rev` fields are used.
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `RevisionPerAuthor` sorted ascending by entity, then descending by
 *   `authorRevs`. Each record contains `entity`, `author`, `authorRevs`, and `totalRevs`.
 *
 * @example
 * asRevisionsPerAuthor(entries, {});
 * // [
 * //   { entity: "A", author: "at", authorRevs: 5, totalRevs: 6 },
 * //   { entity: "A", author: "jt", authorRevs: 1, totalRevs: 6 },
 * // ]
 */
export function asRevisionsPerAuthor(
  entries: VCSEntry[],
  _options: Record<string, unknown>,
): RevisionPerAuthor[] {
  const entityAuthorRevs = computeEntityAuthorRevs(entries);

  const flat: RevisionPerAuthor[] = [];
  for (const { entity, authorRevs } of entityAuthorRevs) {
    for (const { author, revs, totalRevs } of authorRevs) {
      flat.push({ entity, author, authorRevs: revs, totalRevs });
    }
  }

  // Sort by author-revs descending (stable), then by entity ascending
  flat.sort((a, b) => b.authorRevs - a.authorRevs);
  flat.sort((a, b) => compareEntities(a.entity, b.entity));

  return flat;
}

/**
 * Computes the fragmentation (fractal value) of each entity using an effort-based Herfindahl index.
 *
 * The fractal value for an entity is `1 - sum((authorRevs/totalRevs)^2)` over all
 * authors. A value of 0 means a single author owns all commits; values approaching 1
 * indicate effort spread across many authors equally. Results are sorted descending by
 * fractal value; ties are broken by total revision count descending. Values are rounded
 * to two decimal places.
 *
 * @param entries - VCS log entries. Only `entity`, `author`, and `rev` fields are used.
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `EntityFragmentation` sorted descending by `fractalValue`. Each record
 *   contains `entity`, `fractalValue` (0–1, two decimal places), and `totalRevs`.
 *
 * @example
 * asEntityFragmentation(entries, {});
 * // [
 * //   { entity: "A", fractalValue: 0.5, totalRevs: 4 },
 * //   { entity: "B", fractalValue: 0,   totalRevs: 3 },
 * // ]
 */
export function asEntityFragmentation(
  entries: VCSEntry[],
  _options: Record<string, unknown>,
): EntityFragmentation[] {
  const entityAuthorRevs = computeEntityAuthorRevs(entries);

  const result: EntityFragmentation[] = entityAuthorRevs.map(({ entity, authorRevs }) => {
    const totalRevs = authorRevs[0]?.totalRevs ?? 0;
    if (totalRevs === 0) {
      return { entity, fractalValue: 0, totalRevs };
    }

    const sumOfSquares = authorRevs.reduce((acc, { revs }) => {
      return acc + (revs / totalRevs) ** 2;
    }, 0);
    const fractalValue = ratioCentiFloatPrecision(1 - sumOfSquares);
    return { entity, fractalValue, totalRevs };
  });

  // Sort by fractalValue descending, then totalRevs descending
  result.sort((a, b) => {
    if (b.fractalValue !== a.fractalValue) {
      return b.fractalValue - a.fractalValue;
    }
    return b.totalRevs - a.totalRevs;
  });

  return result;
}

/**
 * Identifies the main developer of each entity measured by number of revisions committed.
 *
 * For each entity, the author with the most commits is designated the main developer.
 * The `ownership` ratio (0–1, two decimal places) is their revision share relative to
 * the entity's total revision count. Unlike the churn-based version (`byMainDeveloper` in
 * `churn.ts`), this analysis uses commit count rather than lines added. Results are
 * sorted ascending by entity name.
 *
 * @param entries - VCS log entries. Only `entity`, `author`, and `rev` fields are used.
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `MainDeveloper` sorted ascending by entity. Each record contains
 *   `entity`, `mainDev` (author name), `added` (their revision count), `totalAdded`
 *   (total revisions for the entity), and `ownership` (ratio, two decimal places).
 *
 * @example
 * asMainDeveloperByRevisions(entries, {});
 * // [
 * //   { entity: "A", mainDev: "at", added: 5, totalAdded: 6, ownership: 0.83 },
 * // ]
 */
export function asMainDeveloperByRevisions(
  entries: VCSEntry[],
  _options: Record<string, unknown>,
): MainDeveloper[] {
  const entityAuthorRevs = computeEntityAuthorRevs(entries);

  const result: MainDeveloper[] = entityAuthorRevs.map(({ entity, authorRevs }) => {
    const sorted = [...authorRevs].sort((a, b) => b.revs - a.revs);
    const mainAuthor = sorted[0]!;
    const ownership = ratioCentiFloatPrecision(mainAuthor.revs / mainAuthor.totalRevs);
    return {
      entity,
      mainDev: mainAuthor.author,
      added: mainAuthor.revs,
      totalAdded: mainAuthor.totalRevs,
      ownership,
    };
  });

  // Sort by entity ascending
  result.sort((a, b) => compareEntities(a.entity, b.entity));

  return result;
}
