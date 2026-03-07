import type { VCSEntry } from "../types";

export class IllegalArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalArgumentError";
  }
}

export type CommitMessageOptions = {
  expressionToMatch: string;
};

export type CommitMessageResult = {
  entity: string;
  matches: number;
};

function hasNoRealMessages(entries: VCSEntry[]): boolean {
  const nRows = entries.length;
  if (nRows === 0) return false;
  const nWithMessage = entries.filter((e) => e.message !== undefined && e.message !== "-").length;
  return nWithMessage === 0;
}

function ensureSupportedVcs(entries: VCSEntry[]): VCSEntry[] {
  if (hasNoRealMessages(entries)) {
    throw new IllegalArgumentError(
      "Wrong version-control format. Cannot do a messages analysis without commit messages. " +
        "Look at the difference between the git and git2 formats in the docs."
    );
  }
  return entries;
}

function buildMatchExpr(options: CommitMessageOptions): RegExp {
  return new RegExp(options.expressionToMatch);
}

function rowsMatchingExpr(pattern: RegExp, entries: VCSEntry[]): VCSEntry[] {
  return entries.filter((e) => e.message !== undefined && pattern.test(e.message));
}

function asMatchingEntityFreqs(entries: VCSEntry[]): CommitMessageResult[] {
  const freq = new Map<string, number>();
  for (const entry of entries) {
    freq.set(entry.entity, (freq.get(entry.entity) ?? 0) + 1);
  }
  return Array.from(freq.entries())
    .map(([entity, matches]) => ({ entity, matches }))
    .sort((a, b) => {
      if (b.matches !== a.matches) return b.matches - a.matches;
      return b.entity.localeCompare(a.entity);
    });
}

export function byWordFrequency(
  entries: VCSEntry[],
  options: CommitMessageOptions
): CommitMessageResult[] {
  const validated = ensureSupportedVcs(entries);
  const pattern = buildMatchExpr(options);
  const matched = rowsMatchingExpr(pattern, validated);
  return asMatchingEntityFreqs(matched);
}
