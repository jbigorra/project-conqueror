import type { VCSEntry } from "../types";

export type ParsedEntry = Omit<VCSEntry, "rev"> & { rev: string };

// Commit header: --{hash}--{YYYY-MM-dd}--{author}
const COMMIT_HEADER = /^--([0-9a-f]+)--(\d{4}-\d{2}-\d{2})--(.+)$/;
// File stat line: {added}\t{deleted}\t{path}  (binary files use "-" for added/deleted)
const FILE_LINE = /^(-|\d+)\t(-|\d+)\t(.+)$/;

/**
 * Parses a git2 log string into an array of VCS entries.
 *
 * Expects the log to have been generated with the git2-specific log format:
 * `git log --pretty=format:"--%h--%ad--%an" --date=short --numstat`
 * Each entry represents one file changed in one commit.
 *
 * @param text - Raw log text from a git2 log file.
 * @param _options - Reserved for future use; pass `{}`.
 * @returns Array of `ParsedEntry` objects, one per (commit × file) pair.
 *
 * @example
 * const text = await Bun.file("tests/fixtures/log-fixtures/simple_git2.txt").text();
 * parseReadLog(text, {});
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", locAdded: "1", locDeleted: "2", message: "-" }, ...]
 */
export function parseReadLog(text: string, _options: Record<string, unknown>): ParsedEntry[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const result: ParsedEntry[] = [];
  let currentRev: string | undefined;
  let currentDate: string | undefined;
  let currentAuthor: string | undefined;

  for (const line of lines) {
    const headerMatch = line.match(COMMIT_HEADER);
    if (headerMatch) {
      currentRev = headerMatch[1]!;
      currentDate = headerMatch[2]!;
      currentAuthor = headerMatch[3]!;
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
        message: "-",
      });
    }
  }

  return result;
}

/**
 * Reads a git2 log file from disk and parses it into VCS entries.
 *
 * Convenience async wrapper around {@link parseReadLog}.
 *
 * @param filePath - Absolute or relative path to the log file.
 * @param options - Reserved for future use; pass `{}`.
 * @returns Promise resolving to an array of `ParsedEntry` objects.
 *
 * @example
 * const entries = await parseLog("tests/fixtures/log-fixtures/simple_git2.txt", {});
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", locAdded: "1", locDeleted: "2", message: "-" }, ...]
 */
export function parseLog(
  filePath: string,
  options: Record<string, unknown>,
): Promise<ParsedEntry[]> {
  return Bun.file(filePath)
    .text()
    .then((text) => parseReadLog(text, options));
}
