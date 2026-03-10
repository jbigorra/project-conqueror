import type { VCSEntry } from "../types";
import { ratioCentiFloatPrecision } from "./math";

// Options type for churn analysis - can be extended
type ChurnOptions = Record<string, unknown>;

/** One row of the absolutes-trend analysis: aggregated churn figures for a single date. */
export type AbsolutesTrendEntry = {
  date: string;
  added: number;
  deleted: number;
  commits: number;
};

/** One row of the by-author churn analysis: total lines added/deleted by a single author. */
export type AuthorChurnEntry = {
  author: string;
  added: number;
  deleted: number;
  commits: number;
};

/** One row of the by-entity churn analysis: total lines added/deleted in a single entity. */
export type EntityChurnEntry = {
  entity: string;
  added: number;
  deleted: number;
  commits: number;
};

/** One row of the ownership analysis: lines added/deleted by one author for one entity. */
export type OwnershipEntry = {
  entity: string;
  author: string;
  added: number;
  deleted: number;
};

/** One row of the main-developer analysis: the author who added most lines to an entity. */
export type MainDeveloperEntry = {
  entity: string;
  mainDev: string;
  added: number;
  totalAdded: number;
  ownership: number;
};

/** One row of the refactoring-main-developer analysis: the author who removed most lines from an entity. */
export type RefactoringMainDeveloperEntry = {
  entity: string;
  mainDev: string;
  removed: number;
  totalRemoved: number;
  ownership: number;
};

function throwOnMissingData(entries: VCSEntry[]): void {
  const hasMissingData = entries.some(
    (e) => e.locAdded === undefined || e.locDeleted === undefined,
  );
  if (hasMissingData) {
    throw new Error(
      "churn analysis: the given VCS data doesn't contain modification metrics. " +
        "Check the code-maat docs for supported VCS and correct log format.",
    );
  }
}

/**
 * Parse a loc value. Binary files use "-" which counts as 0.
 */
function asInt(v: string): number {
  if (v === "-") return 0;
  return parseInt(v, 10);
}

function locMetrics(entry: VCSEntry): { locAdded: string; locDeleted: string } {
  if (entry.locAdded === undefined || entry.locDeleted === undefined) {
    throw new Error(
      "churn analysis: the given VCS data doesn't contain modification metrics. " +
        "Check the code-maat docs for supported VCS and correct log format.",
    );
  }
  return { locAdded: entry.locAdded, locDeleted: entry.locDeleted };
}

function groupEntriesBy<K>(
  entries: VCSEntry[],
  keySelector: (entry: VCSEntry) => K | undefined,
): Map<K, VCSEntry[]> {
  const groups = new Map<K, VCSEntry[]>();

  for (const entry of entries) {
    const key = keySelector(entry);
    if (key === undefined) continue;

    const existing = groups.get(key);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(key, [entry]);
    }
  }

  return groups;
}

/**
 * Count distinct revisions in a group of entries.
 */
function distinctRevisionCount(entries: VCSEntry[]): number {
  return new Set(entries.map((e) => e.rev)).size;
}

/**
 * Calculates the absolute code churn measures grouped by date.
 *
 * For each unique date in the log, sums up all lines added and deleted across every
 * entity touched on that day and counts distinct revisions (commits). Binary files
 * that report "-" for loc values are counted as zero. Results are sorted ascending
 * by date; ties are broken by lines added, then lines deleted.
 *
 * @param entries - VCS log entries. Every entry must have `locAdded` and `locDeleted`
 *   set, otherwise an error is thrown.
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `AbsolutesTrendEntry` sorted ascending by date. Each record has
 *   `date` (YYYY-MM-DD), `added`, `deleted` (total loc), and `commits` (distinct revisions).
 *
 * @example
 * absolutesTrend(entries, {});
 * // [
 * //   { date: "2013-11-10", added: 11, deleted: 2, commits: 1 },
 * //   { date: "2013-11-11", added: 22, deleted: 2, commits: 2 },
 * // ]
 */
export function absolutesTrend(entries: VCSEntry[], _options: ChurnOptions): AbsolutesTrendEntry[] {
  throwOnMissingData(entries);

  const groups = groupEntriesBy(entries, (entry) => entry.date);

  const result: AbsolutesTrendEntry[] = [];
  for (const [date, groupEntries] of groups) {
    const added = groupEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locAdded), 0);
    const deleted = groupEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locDeleted), 0);
    const commits = distinctRevisionCount(groupEntries);
    result.push({ date, added, deleted, commits });
  }

  return result.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    if (a.added < b.added) return -1;
    if (a.added > b.added) return 1;
    if (a.deleted < b.deleted) return -1;
    if (a.deleted > b.deleted) return 1;
    return 0;
  });
}

/**
 * Sums the total code churn contributed by each author across all entities.
 *
 * Groups entries by author, then sums lines added and deleted. Distinct revisions
 * (commits) per author are counted with deduplication. Binary files ("-") count as
 * zero. Throws if any entry is missing `locAdded` or `locDeleted`.
 *
 * @param entries - VCS log entries with churn data (`locAdded`, `locDeleted` required).
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `AuthorChurnEntry` sorted ascending by author name, then by lines added.
 *   Each record contains `author`, `added`, `deleted`, and `commits`.
 *
 * @example
 * byAuthor(entries, {});
 * // [
 * //   { author: "at", added: 13, deleted: 2, commits: 2 },
 * //   { author: "ta", added: 20, deleted: 2, commits: 1 },
 * // ]
 */
export function byAuthor(entries: VCSEntry[], _options: ChurnOptions): AuthorChurnEntry[] {
  throwOnMissingData(entries);

  const groups = groupEntriesBy(entries, (entry) => entry.author);

  const result: AuthorChurnEntry[] = [];
  for (const [author, groupEntries] of groups) {
    const added = groupEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locAdded), 0);
    const deleted = groupEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locDeleted), 0);
    const commits = distinctRevisionCount(groupEntries);
    result.push({ author, added, deleted, commits });
  }

  return result.sort((a, b) => {
    if (a.author < b.author) return -1;
    if (a.author > b.author) return 1;
    return a.added - b.added;
  });
}

/**
 * Returns the absolute code churn for each entity (file/module).
 *
 * Groups all entries by entity and sums lines added and deleted across every
 * revision that touched it. Commit count is the number of distinct revisions.
 * Binary files ("-") are counted as zero churn. Throws if churn data is absent.
 *
 * @param entries - VCS log entries with `locAdded` and `locDeleted` fields.
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `EntityChurnEntry` sorted descending by lines added. Each record
 *   contains `entity`, `added`, `deleted`, and `commits`.
 *
 * @example
 * byEntity(entries, {});
 * // [
 * //   { entity: "B", added: 23, deleted: 3, commits: 2 },
 * //   { entity: "A", added: 10, deleted: 1, commits: 1 },
 * // ]
 */
export function byEntity(entries: VCSEntry[], _options: ChurnOptions): EntityChurnEntry[] {
  throwOnMissingData(entries);

  const groups = groupEntriesBy(entries, (entry) => entry.entity);

  const result: EntityChurnEntry[] = [];
  for (const [entity, groupEntries] of groups) {
    const added = groupEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locAdded), 0);
    const deleted = groupEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locDeleted), 0);
    const commits = distinctRevisionCount(groupEntries);
    result.push({ entity, added, deleted, commits });
  }

  // Sort descending by added
  return result.sort((a, b) => b.added - a.added);
}

/**
 * Returns the churn contribution (ownership) broken down by entity and author.
 *
 * For each entity, groups entries by author and sums the lines each author added
 * and deleted. This allows computing each author's share of work on a given module.
 * Throws if churn data is absent. Insertion order within an entity is preserved;
 * the outer sort is ascending by entity name.
 *
 * @param entries - VCS log entries with `locAdded` and `locDeleted` fields.
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `OwnershipEntry` sorted ascending by entity. Each record contains
 *   `entity`, `author`, `added`, and `deleted`.
 *
 * @example
 * asOwnership(entries, {});
 * // [
 * //   { entity: "A", author: "at", added: 12, deleted: 6 },
 * //   { entity: "A", author: "xy", added: 15, deleted: 3 },
 * // ]
 */
export function asOwnership(entries: VCSEntry[], _options: ChurnOptions): OwnershipEntry[] {
  throwOnMissingData(entries);

  // Group by entity
  const entityGroups = groupEntriesBy(entries, (entry) => entry.entity);

  const result: OwnershipEntry[] = [];

  for (const [entity, entityEntries] of entityGroups) {
    // Group by author within entity
    const authorGroups = groupEntriesBy(entityEntries, (entry) => entry.author);

    for (const [author, authorEntries] of authorGroups) {
      const added = authorEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locAdded), 0);
      const deleted = authorEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locDeleted), 0);
      result.push({ entity, author, added, deleted });
    }
  }

  // Sort ascending by entity only (preserve insertion order within entity)
  return result.sort((a, b) => {
    if (a.entity < b.entity) return -1;
    if (a.entity > b.entity) return 1;
    return 0;
  });
}

type AuthorContrib = {
  author: string;
  added: number;
  deleted: number;
};

function getAuthorContribs(entries: VCSEntry[]): Map<string, AuthorContrib> {
  const authorGroups = groupEntriesBy(entries, (entry) => entry.author);

  const contribs = new Map<string, AuthorContrib>();
  for (const [author, authorEntries] of authorGroups) {
    const added = authorEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locAdded), 0);
    const deleted = authorEntries.reduce((sum, e) => sum + asInt(locMetrics(e).locDeleted), 0);
    contribs.set(author, { author, added, deleted });
  }
  return contribs;
}

function asOwnershipRatio(own: number, total: number): number {
  const safeDenominator = Math.max(total, 1);
  return ratioCentiFloatPrecision(own / safeDenominator);
}

/**
 * Identifies the main developer of each entity based on lines of code added.
 *
 * The main developer is the author with the highest `locAdded` total for that entity.
 * An `ownership` ratio (0–1, two decimal places) expresses their share of total lines
 * added. Throws if churn data is absent. Sorted ascending by entity name.
 *
 * @param entries - VCS log entries with `locAdded` and `locDeleted` fields.
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `MainDeveloperEntry` sorted ascending by entity. Each record contains
 *   `entity`, `mainDev` (author name), `added` (their lines), `totalAdded`, and `ownership`.
 *
 * @example
 * byMainDeveloper(entries, {});
 * // [
 * //   { entity: "A", mainDev: "xy", added: 15, totalAdded: 27, ownership: 0.56 },
 * // ]
 */
export function byMainDeveloper(entries: VCSEntry[], _options: ChurnOptions): MainDeveloperEntry[] {
  throwOnMissingData(entries);

  // Group by entity
  const entityGroups = groupEntriesBy(entries, (entry) => entry.entity);

  const result: MainDeveloperEntry[] = [];

  for (const [entity, entityEntries] of entityGroups) {
    const contribs = getAuthorContribs(entityEntries);
    const contribList = [...contribs.values()];

    const totalAdded = contribList.reduce((sum, c) => sum + c.added, 0);
    // Pick author with max added
    const mainDevContrib = contribList.reduce((best, c) => (c.added > best.added ? c : best));

    const ownership = asOwnershipRatio(mainDevContrib.added, totalAdded);

    result.push({
      entity,
      mainDev: mainDevContrib.author,
      added: mainDevContrib.added,
      totalAdded,
      ownership,
    });
  }

  return result.sort((a, b) => {
    if (a.entity < b.entity) return -1;
    if (a.entity > b.entity) return 1;
    return 0;
  });
}

/**
 * Identifies the main refactoring developer of each entity based on lines of code removed.
 *
 * The refactoring main developer is the author with the highest `locDeleted` total for
 * that entity. When two authors have an equal deletion count, the last one encountered
 * in insertion order wins (mirrors Clojure's stable sort + reverse + first behaviour).
 * An `ownership` ratio (0–1, two decimal places) expresses their share of total lines
 * removed. Throws if churn data is absent. Sorted ascending by entity name.
 *
 * @param entries - VCS log entries with `locAdded` and `locDeleted` fields.
 * @param _options - Unused options placeholder for API consistency.
 * @returns Array of `RefactoringMainDeveloperEntry` sorted ascending by entity. Each record
 *   contains `entity`, `mainDev` (author name), `removed` (their deleted lines),
 *   `totalRemoved`, and `ownership`.
 *
 * @example
 * byRefactoringMainDeveloper(entries, {});
 * // [
 * //   { entity: "A", mainDev: "xy", removed: 3, totalRemoved: 9, ownership: 0.33 },
 * // ]
 */
export function byRefactoringMainDeveloper(
  entries: VCSEntry[],
  _options: ChurnOptions,
): RefactoringMainDeveloperEntry[] {
  throwOnMissingData(entries);

  // Group by entity
  const entityGroups = groupEntriesBy(entries, (entry) => entry.entity);

  const result: RefactoringMainDeveloperEntry[] = [];

  for (const [entity, entityEntries] of entityGroups) {
    const contribs = getAuthorContribs(entityEntries);
    const contribList = [...contribs.values()];

    const totalRemoved = contribList.reduce((sum, c) => sum + c.deleted, 0);
    // Pick author with max deleted; on ties, the last in insertion order wins
    // (matches Clojure's stable sort + reverse + first behaviour)
    const mainDevContrib = contribList.reduce((best, c) => (c.deleted >= best.deleted ? c : best));

    const ownership = asOwnershipRatio(mainDevContrib.deleted, totalRemoved);

    result.push({
      entity,
      mainDev: mainDevContrib.author,
      removed: mainDevContrib.deleted,
      totalRemoved,
      ownership,
    });
  }

  return result.sort((a, b) => {
    if (a.entity < b.entity) return -1;
    if (a.entity > b.entity) return 1;
    return 0;
  });
}
