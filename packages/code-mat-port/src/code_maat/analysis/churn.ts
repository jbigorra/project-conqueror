import type { VCSEntry } from "../types";
import { ratioCentiFloatPrecision } from "./math";

// Options type for churn analysis - can be extended
type ChurnOptions = Record<string, unknown>;

export type AbsolutesTrendEntry = {
  date: string;
  added: number;
  deleted: number;
  commits: number;
};

export type AuthorChurnEntry = {
  author: string;
  added: number;
  deleted: number;
  commits: number;
};

export type EntityChurnEntry = {
  entity: string;
  added: number;
  deleted: number;
  commits: number;
};

export type OwnershipEntry = {
  entity: string;
  author: string;
  added: number;
  deleted: number;
};

export type MainDeveloperEntry = {
  entity: string;
  mainDev: string;
  added: number;
  totalAdded: number;
  ownership: number;
};

export type RefactoringMainDeveloperEntry = {
  entity: string;
  mainDev: string;
  removed: number;
  totalRemoved: number;
  ownership: number;
};

function throwOnMissingData(entries: VCSEntry[]): void {
  const hasMissingData = entries.some(
    e => e.locAdded === undefined || e.locDeleted === undefined
  );
  if (hasMissingData) {
    throw new Error(
      "churn analysis: the given VCS data doesn't contain modification metrics. " +
        "Check the code-maat docs for supported VCS and correct log format."
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

/**
 * Count distinct revisions in a group of entries.
 */
function distinctRevisionCount(entries: VCSEntry[]): number {
  return new Set(entries.map(e => e.rev)).size;
}


/**
 * Calculates the absolute code churn measures per date.
 * Sorted ascending by date.
 */
export function absolutesTrend(
  entries: VCSEntry[],
  _options: ChurnOptions
): AbsolutesTrendEntry[] {
  throwOnMissingData(entries);

  const groups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const date = entry.date!;
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(entry);
  }

  const result: AbsolutesTrendEntry[] = [];
  for (const [date, groupEntries] of groups) {
    const added = groupEntries.reduce(
      (sum, e) => sum + asInt(e.locAdded!),
      0
    );
    const deleted = groupEntries.reduce(
      (sum, e) => sum + asInt(e.locDeleted!),
      0
    );
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
 * Sums the total churn for each contributing author.
 * Sorted ascending by author, then added.
 */
export function byAuthor(
  entries: VCSEntry[],
  _options: ChurnOptions
): AuthorChurnEntry[] {
  throwOnMissingData(entries);

  const groups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const author = entry.author;
    if (!groups.has(author)) groups.set(author, []);
    groups.get(author)!.push(entry);
  }

  const result: AuthorChurnEntry[] = [];
  for (const [author, groupEntries] of groups) {
    const added = groupEntries.reduce(
      (sum, e) => sum + asInt(e.locAdded!),
      0
    );
    const deleted = groupEntries.reduce(
      (sum, e) => sum + asInt(e.locDeleted!),
      0
    );
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
 * Returns the absolute churn of each entity.
 * Sorted descending by lines added.
 */
export function byEntity(
  entries: VCSEntry[],
  _options: ChurnOptions
): EntityChurnEntry[] {
  throwOnMissingData(entries);

  const groups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const entity = entry.entity;
    if (!groups.has(entity)) groups.set(entity, []);
    groups.get(entity)!.push(entry);
  }

  const result: EntityChurnEntry[] = [];
  for (const [entity, groupEntries] of groups) {
    const added = groupEntries.reduce(
      (sum, e) => sum + asInt(e.locAdded!),
      0
    );
    const deleted = groupEntries.reduce(
      (sum, e) => sum + asInt(e.locDeleted!),
      0
    );
    const commits = distinctRevisionCount(groupEntries);
    result.push({ entity, added, deleted, commits });
  }

  // Sort descending by added
  return result.sort((a, b) => b.added - a.added);
}

/**
 * Returns ownership of each module by each author (churn contribution).
 * Sorted ascending by entity, then author.
 */
export function asOwnership(
  entries: VCSEntry[],
  _options: ChurnOptions
): OwnershipEntry[] {
  throwOnMissingData(entries);

  // Group by entity
  const entityGroups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const entity = entry.entity;
    if (!entityGroups.has(entity)) entityGroups.set(entity, []);
    entityGroups.get(entity)!.push(entry);
  }

  const result: OwnershipEntry[] = [];

  for (const [entity, entityEntries] of entityGroups) {
    // Group by author within entity
    const authorGroups = new Map<string, VCSEntry[]>();
    for (const entry of entityEntries) {
      const author = entry.author;
      if (!authorGroups.has(author)) authorGroups.set(author, []);
      authorGroups.get(author)!.push(entry);
    }

    for (const [author, authorEntries] of authorGroups) {
      const added = authorEntries.reduce(
        (sum, e) => sum + asInt(e.locAdded!),
        0
      );
      const deleted = authorEntries.reduce(
        (sum, e) => sum + asInt(e.locDeleted!),
        0
      );
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
  const authorGroups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const author = entry.author;
    if (!authorGroups.has(author)) authorGroups.set(author, []);
    authorGroups.get(author)!.push(entry);
  }

  const contribs = new Map<string, AuthorContrib>();
  for (const [author, authorEntries] of authorGroups) {
    const added = authorEntries.reduce(
      (sum, e) => sum + asInt(e.locAdded!),
      0
    );
    const deleted = authorEntries.reduce(
      (sum, e) => sum + asInt(e.locDeleted!),
      0
    );
    contribs.set(author, { author, added, deleted });
  }
  return contribs;
}

function asOwnershipRatio(own: number, total: number): number {
  const safeDenominator = Math.max(total, 1);
  return ratioCentiFloatPrecision(own / safeDenominator);
}

/**
 * Identifies the main developer of each entity.
 * Main developer = the one who contributed most lines of code (added).
 * Sorted ascending by entity.
 */
export function byMainDeveloper(
  entries: VCSEntry[],
  _options: ChurnOptions
): MainDeveloperEntry[] {
  throwOnMissingData(entries);

  // Group by entity
  const entityGroups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const entity = entry.entity;
    if (!entityGroups.has(entity)) entityGroups.set(entity, []);
    entityGroups.get(entity)!.push(entry);
  }

  const result: MainDeveloperEntry[] = [];

  for (const [entity, entityEntries] of entityGroups) {
    const contribs = getAuthorContribs(entityEntries);
    const contribList = [...contribs.values()];

    const totalAdded = contribList.reduce((sum, c) => sum + c.added, 0);
    // Pick author with max added
    const mainDevContrib = contribList.reduce((best, c) =>
      c.added > best.added ? c : best
    );

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
 * Identifies the main developer of each entity by lines removed (refactoring perspective).
 * Main developer = the one who removed most lines.
 * Sorted ascending by entity.
 */
export function byRefactoringMainDeveloper(
  entries: VCSEntry[],
  _options: ChurnOptions
): RefactoringMainDeveloperEntry[] {
  throwOnMissingData(entries);

  // Group by entity
  const entityGroups = new Map<string, VCSEntry[]>();
  for (const entry of entries) {
    const entity = entry.entity;
    if (!entityGroups.has(entity)) entityGroups.set(entity, []);
    entityGroups.get(entity)!.push(entry);
  }

  const result: RefactoringMainDeveloperEntry[] = [];

  for (const [entity, entityEntries] of entityGroups) {
    const contribs = getAuthorContribs(entityEntries);
    const contribList = [...contribs.values()];

    const totalRemoved = contribList.reduce((sum, c) => sum + c.deleted, 0);
    // Pick author with max deleted
    const mainDevContrib = contribList.reduce((best, c) =>
      c.deleted > best.deleted ? c : best
    );

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
