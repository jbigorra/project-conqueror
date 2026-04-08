import type { VCSEntry } from "../types";

/** A VCS entry parsed from a git log, with `rev` narrowed to `string` (commit hash). */
export type ParsedEntry = Omit<VCSEntry, "rev"> & { rev: string };

// [hash] author YYYY-MM-dd message
// Author uses lazy match to stop at the FIRST date-like field, so dates in messages are ignored
const COMMIT_HEADER = /^\[([0-9a-f]+)\]\s+(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(.*)$/;
const FILE_LINE = /^(-|\d+)\t(-|\d+)\t(.+)$/;

/**
 * Parses a git log string into an array of VCS entries.
 *
 * Expects the log to have been generated with the git-specific log format:
 * `git log --pretty=format:"[%h] %an %ad %s" --date=short --numstat`
 * Each entry represents one file changed in one commit.
 *
 * @param text - Raw log text from a git log file.
 * @param _options - Reserved for future use; pass `{}`.
 * @returns Array of `ParsedEntry` objects, one per (commit × file) pair.
 *
 * @example
 * const text = await Bun.file("tests/fixtures/log-fixtures/simple_git.txt").text();
 * parseReadLog(text, {});
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", locAdded: "1", locDeleted: "2", message: "git: authors and revisions implemented" }, ...]
 */
export function parseReadLog(text: string, _options: Record<string, unknown>): ParsedEntry[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const result: ParsedEntry[] = [];
  let currentRev: string | undefined;
  let currentDate: string | undefined;
  let currentAuthor: string | undefined;
  let currentMessage: string | undefined;

  for (const line of lines) {
    const headerMatch = line.match(COMMIT_HEADER);
    if (headerMatch) {
      currentRev = headerMatch[1]!;
      currentAuthor = headerMatch[2]!;
      currentDate = headerMatch[3]!;
      currentMessage = headerMatch[4]!;
      continue;
    }

    const fileMatch = line.match(FILE_LINE);
    if (fileMatch && currentRev) {
      result.push({
        locAdded: fileMatch[1]!,
        locDeleted: fileMatch[2]!,
        entity: fileMatch[3]!,
        rev: currentRev,
        date: currentDate!,
        author: currentAuthor!,
        message: currentMessage ?? "-",
      });
    }
  }

  return result;
}

/**
 * Reads a git log file from disk and parses it into VCS entries.
 *
 * Convenience async wrapper around {@link parseReadLog}.
 *
 * @param filePath - Absolute or relative path to the log file.
 * @param options - Reserved for future use; pass `{}`.
 * @returns Promise resolving to an array of `ParsedEntry` objects.
 *
 * @example
 * const entries = await parseLog("tests/fixtures/log-fixtures/simple_git.txt", {});
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", locAdded: "1", locDeleted: "2", message: "git: authors and revisions implemented" }, ...]
 */
export function parseLog(
  filePath: string,
  options: Record<string, unknown>,
): Promise<ParsedEntry[]> {
  return Bun.file(filePath)
    .text()
    .then((text) => parseReadLog(text, options));
}
