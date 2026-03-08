import type { VCSEntry } from "../types";

export type RevisionPerAuthor = {
  entity: string;
  author: string;
  authorRevs: number;
  totalRevs: number;
};

export type EntityFragmentation = {
  entity: string;
  fractalValue: number;
  totalRevs: number;
};

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

function ratioToCentiFloatPrecision(ratio: number): number {
  return Math.round(ratio * 100) / 100;
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
  flat.sort((a, b) => a.entity.localeCompare(b.entity));

  return flat;
}

export function asEntityFragmentation(
  entries: VCSEntry[],
  _options: Record<string, unknown>,
): EntityFragmentation[] {
  const entityAuthorRevs = computeEntityAuthorRevs(entries);

  const result: EntityFragmentation[] = entityAuthorRevs.map(({ entity, authorRevs }) => {
    const totalRevs = authorRevs[0]!.totalRevs;
    const sumOfSquares = authorRevs.reduce((acc, { revs }) => {
      return acc + (revs / totalRevs) ** 2;
    }, 0);
    const fractalValue = ratioToCentiFloatPrecision(1 - sumOfSquares);
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

export function asMainDeveloperByRevisions(
  entries: VCSEntry[],
  _options: Record<string, unknown>,
): MainDeveloper[] {
  const entityAuthorRevs = computeEntityAuthorRevs(entries);

  const result: MainDeveloper[] = entityAuthorRevs.map(({ entity, authorRevs }) => {
    const sorted = [...authorRevs].sort((a, b) => b.revs - a.revs);
    const mainAuthor = sorted[0]!;
    const ownership = ratioToCentiFloatPrecision(mainAuthor.revs / mainAuthor.totalRevs);
    return {
      entity,
      mainDev: mainAuthor.author,
      added: mainAuthor.revs,
      totalAdded: mainAuthor.totalRevs,
      ownership,
    };
  });

  // Sort by entity ascending
  result.sort((a, b) => a.entity.localeCompare(b.entity));

  return result;
}
