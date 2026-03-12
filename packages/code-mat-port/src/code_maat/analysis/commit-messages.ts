import type { VCSEntry } from "../types";

/**
 * Error thrown when the VCS log format does not contain commit messages, making
 * a commit-message analysis impossible (e.g. git2 format instead of git format).
 */
export class IllegalArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalArgumentError";
  }
}

/** Options controlling which commit messages are matched. */
export type CommitMessageOptions = {
  /** A JavaScript-compatible regular expression string applied to each commit message. */
  expressionToMatch: string;
};

/** One row of the commit-message frequency analysis: entity and how many times its commit messages matched. */
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
        "Look at the difference between the git and git2 formats in the docs.",
    );
  }
  return entries;
}

function buildMatchExpr(options: CommitMessageOptions): RegExp {
  try {
    return new RegExp(options.expressionToMatch);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new IllegalArgumentError(
      `Invalid expressionToMatch regex: ${options.expressionToMatch}. ${detail}`,
    );
  }
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

/**
 * Counts how many times each entity appears in commits whose message matches a given pattern.
 *
 * Scans every VCS entry for a commit message matching `options.expressionToMatch` (a
 * JavaScript regex). Each matched entry increments the counter for its entity. Entries
 * with a missing or sentinel ("-") message are ignored. If the dataset contains no real
 * messages at all, `IllegalArgumentError` is thrown — this typically indicates a git2 or
 * other format that omits commit messages. Results are sorted descending by match count;
 * ties are broken by entity name descending.
 *
 * @param entries - VCS log entries. Must include a `message` field for any entity to appear
 *   in the output; entries without `message` or with `message === "-"` are skipped.
 * @param options - `{ expressionToMatch }` — regex string to test against each commit message.
 * @returns Array of `CommitMessageResult` sorted descending by `matches`. Each record
 *   contains `entity` (file path) and `matches` (number of matching commits).
 *
 * @example
 * byWordFrequency(entries, { expressionToMatch: "change" });
 * // [
 * //   { entity: "A", matches: 3 },
 * //   { entity: "B", matches: 1 },
 * // ]
 */
export function byWordFrequency(
  entries: VCSEntry[],
  options: CommitMessageOptions,
): CommitMessageResult[] {
  const validated = ensureSupportedVcs(entries);
  const pattern = buildMatchExpr(options);
  const matched = rowsMatchingExpr(pattern, validated);
  return asMatchingEntityFreqs(matched);
}
