export type PerforceEntry = {
  author: string;
  rev: string;
  date: string;
  entity: string;
  message: string;
};

// Change {rev} by {user}@{client} on {YYYY/MM/dd} {HH:MM:SS}
const CHANGE_HEADER = /^Change\s+(\d+)\s+by\s+([^@]+)@\S+\s+on\s+(\d{4})\/(\d{2})\/(\d{2})\s+/;
// File line: ... //{depot}/{project}/{rest}#{rev} {action}
const FILE_LINE = /^\.\.\.\s+\/\/[^/]+\/[^/]+([^#]+)#.+$/;

type State = "HEADER" | "MESSAGE" | "JOBS" | "FILES";

/**
 * Parses a Perforce log string into an array of VCS entries.
 *
 * Expects the log to have been generated with the Perforce `p4 filelog` or `p4 describe`
 * command output format. Each entry represents one file changed in one changelist.
 *
 * @param text - Raw log text from a Perforce describe output.
 * @param _options - Reserved for future use; pass `{}`.
 * @returns Array of `PerforceEntry` objects, one per (changelist × file) pair.
 *
 * @example
 * const text = await Bun.file("tests/fixtures/log-fixtures/simple_p4.txt").text();
 * parseReadLog(text, {});
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", message: "" }, ...]
 */
export function parseReadLog(text: string, _options: Record<string, unknown>): PerforceEntry[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const result: PerforceEntry[] = [];

  let state: State = "HEADER";
  let currentRev = "";
  let currentAuthor = "";
  let currentDate = "";

  for (const line of lines) {
    const headerMatch = line.match(CHANGE_HEADER);
    if (headerMatch) {
      currentRev = headerMatch[1]!;
      currentAuthor = headerMatch[2]!;
      currentDate = `${headerMatch[3]!}-${headerMatch[4]!}-${headerMatch[5]!}`;
      state = "MESSAGE";
      continue;
    }

    if (state === "MESSAGE" || state === "JOBS") {
      if (line === "Affected files ...") {
        state = "FILES";
        continue;
      }
      if (line.startsWith("Jobs fixed ...")) {
        state = "JOBS";
        continue;
      }
      continue; // skip message/job lines
    }

    if (state === "FILES") {
      if (!line.trim()) {
        state = "HEADER";
        continue;
      }
      const fileMatch = line.match(FILE_LINE);
      if (fileMatch) {
        result.push({
          author: currentAuthor,
          rev: currentRev,
          date: currentDate,
          entity: fileMatch[1]!,
          message: "",
        });
      }
    }
  }

  return result;
}

/**
 * Reads a Perforce log file from disk and parses it into VCS entries.
 *
 * Convenience async wrapper around {@link parseReadLog}.
 *
 * @param filePath - Absolute or relative path to the log file.
 * @param options - Reserved for future use; pass `{}`.
 * @returns Promise resolving to an array of `PerforceEntry` objects.
 *
 * @example
 * const entries = await parseLog("tests/fixtures/log-fixtures/simple_p4.txt", {});
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", message: "" }, ...]
 */
export function parseLog(
  filePath: string,
  options: Record<string, unknown>,
): Promise<PerforceEntry[]> {
  return Bun.file(filePath)
    .text()
    .then((text) => parseReadLog(text, options));
}
