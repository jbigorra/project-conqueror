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

type ChangeContext = {
  author: string;
  rev: string;
  date: string;
};

function getCapture(match: RegExpMatchArray, index: number, context: string): string {
  const value = match[index];
  if (value === undefined) {
    throw new Error(`Malformed Perforce log: missing ${context}`);
  }
  return value;
}

function parseChangeContext(line: string): ChangeContext | null {
  const headerMatch = line.match(CHANGE_HEADER);
  if (!headerMatch) return null;

  const rev = getCapture(headerMatch, 1, "revision");
  const author = getCapture(headerMatch, 2, "author");
  const year = getCapture(headerMatch, 3, "year");
  const month = getCapture(headerMatch, 4, "month");
  const day = getCapture(headerMatch, 5, "day");

  return {
    author,
    rev,
    date: `${year}-${month}-${day}`,
  };
}

function nextParseState(line: string, currentState: State): State {
  if (line === "Affected files ...") {
    return "FILES";
  }

  if (line.startsWith("Jobs fixed ...")) {
    return "JOBS";
  }

  return currentState;
}

function parseFileEntry(line: string, change: ChangeContext | null): PerforceEntry | null {
  if (!change) return null;

  const fileMatch = line.match(FILE_LINE);
  if (!fileMatch) return null;

  return {
    author: change.author,
    rev: change.rev,
    date: change.date,
    entity: getCapture(fileMatch, 1, "entity"),
    message: "",
  };
}

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

  const result: PerforceEntry[] = [];

  let state: State = "HEADER";
  let currentChange: ChangeContext | null = null;

  for (const line of text.split("\n")) {
    const header = parseChangeContext(line);
    if (header) {
      currentChange = header;
      state = "MESSAGE";
      continue;
    }

    if (state === "MESSAGE" || state === "JOBS") {
      state = nextParseState(line, state);
      continue; // skip message/job lines
    }

    if (state === "FILES") {
      if (!line.trim()) {
        state = "HEADER";
        currentChange = null;
        continue;
      }

      const fileEntry = parseFileEntry(line, currentChange);
      if (fileEntry) {
        result.push(fileEntry);
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
