export type MercurialEntry = {
  author: string;
  rev: string;
  date: string;
  entity: string;
  message: string;
};

// Header: rev: {n} author: {author} date: {YYYY-MM-dd} files:
// Author uses lazy match to stop at " date: YYYY-"
const COMMIT_HEADER = /^rev:\s+(\d+)\s+author:\s+(.+?)\s+date:\s+(\d{4}-\d{2}-\d{2})\s+files:$/;

/**
 * Parses a Mercurial log string into an array of VCS entries.
 *
 * Expects the log to have been generated with the Mercurial-specific log format:
 * `hg log --template "rev: {rev} author: {author} date: {date|shortdate} files:\n{files % '{file}\n'}\n"`
 * Each entry represents one file changed in one commit.
 *
 * @param text - Raw log text from a Mercurial log file.
 * @param _options - Reserved for future use; pass `{}`.
 * @returns Array of `MercurialEntry` objects, one per (commit × file) pair.
 *
 * @example
 * const text = await Bun.file("tests/fixtures/log-fixtures/simple_hg.txt").text();
 * parseReadLog(text, {});
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", message: "-" }, ...]
 */
export function parseReadLog(text: string, _options: Record<string, unknown>): MercurialEntry[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const result: MercurialEntry[] = [];
  let currentRev: string | undefined;
  let currentDate: string | undefined;
  let currentAuthor: string | undefined;

  for (const line of lines) {
    const headerMatch = line.match(COMMIT_HEADER);
    if (headerMatch) {
      currentRev = headerMatch[1]!;
      currentAuthor = headerMatch[2]!;
      currentDate = headerMatch[3]!;
      continue;
    }

    // Non-empty, non-header line following a commit header = a file entity
    if (line.trim() && currentRev) {
      result.push({
        author: currentAuthor!,
        rev: currentRev,
        date: currentDate!,
        entity: line,
        message: "-",
      });
    }
  }

  return result;
}

/**
 * Reads a Mercurial log file from disk and parses it into VCS entries.
 *
 * Convenience async wrapper around {@link parseReadLog}.
 *
 * @param filePath - Absolute or relative path to the log file.
 * @param options - Reserved for future use; pass `{}`.
 * @returns Promise resolving to an array of `MercurialEntry` objects.
 *
 * @example
 * const entries = await parseLog("tests/fixtures/log-fixtures/simple_hg.txt", {});
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", message: "-" }, ...]
 */
export function parseLog(
  filePath: string,
  options: Record<string, unknown>,
): Promise<MercurialEntry[]> {
  return Bun.file(filePath)
    .text()
    .then((text) => parseReadLog(text, options));
}
