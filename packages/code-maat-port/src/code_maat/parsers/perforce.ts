/** A VCS entry parsed from a Perforce changelist log (no churn data — only author, rev, date, entity, and a placeholder message). */
export type PerforceEntry = {
  /** Author (user) who submitted the changelist. */
  author: string;
  /** Changelist number as a string. */
  rev: string;
  /** Submit date in `YYYY-MM-DD` format. */
  date: string;
  /** Depot file path relative to the project root. */
  entity: string;
  /** Always `"-"` — Perforce log format does not capture descriptions per file. */
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

type ParserContext = {
  state: State;
  currentChange: ChangeContext | null;
  result: PerforceEntry[];
};

type CaptureRequest = {
  match: RegExpMatchArray;
  index: number;
  context: string;
};

function getCapture({ match, index, context }: CaptureRequest): string {
  const value = match[index];
  if (value === undefined) {
    throw new Error(`Malformed Perforce log: missing ${context}`);
  }
  return value;
}

function parseChangeContext(line: string): ChangeContext | null {
  const headerMatch = line.match(CHANGE_HEADER);
  if (!headerMatch) return null;

  const rev = getCapture({ match: headerMatch, index: 1, context: "revision" });
  const author = getCapture({ match: headerMatch, index: 2, context: "author" });
  const year = getCapture({ match: headerMatch, index: 3, context: "year" });
  const month = getCapture({ match: headerMatch, index: 4, context: "month" });
  const day = getCapture({ match: headerMatch, index: 5, context: "day" });

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
    entity: getCapture({ match: fileMatch, index: 1, context: "entity" }),
    message: "-",
  };
}

function createParserContext(): ParserContext {
  return {
    state: "HEADER",
    currentChange: null,
    result: [],
  };
}

function beginChange(context: ParserContext, change: ChangeContext): void {
  context.currentChange = change;
  context.state = "MESSAGE";
}

function resetChange(context: ParserContext): void {
  context.currentChange = null;
  context.state = "HEADER";
}

function isSkippingSection(state: State): boolean {
  return state === "MESSAGE" || state === "JOBS";
}

function consumeFileLine(context: ParserContext, line: string): void {
  if (!line.trim()) {
    resetChange(context);
    return;
  }

  const fileEntry = parseFileEntry(line, context.currentChange);
  if (fileEntry) {
    context.result.push(fileEntry);
  }
}

function consumeLine(context: ParserContext, line: string): void {
  const change = parseChangeContext(line);
  if (change) {
    beginChange(context, change);
    return;
  }

  if (isSkippingSection(context.state)) {
    context.state = nextParseState(line, context.state);
    return;
  }

  if (context.state !== "FILES") {
    return;
  }

  consumeFileLine(context, line);
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
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", message: "-" }, ...]
 */
export function parseReadLog(text: string, _options: Record<string, unknown>): PerforceEntry[] {
  if (!text.trim()) return [];

  const context = createParserContext();

  for (const line of text.split("\n")) {
    consumeLine(context, line);
  }

  return context.result;
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
 * // [{ author: "APT", entity: "/Infrastrucure/Network/Connection.cs", rev: "2", date: "2013-02-08", message: "-" }, ...]
 */
export function parseLog(
  filePath: string,
  options: Record<string, unknown>,
): Promise<PerforceEntry[]> {
  return Bun.file(filePath)
    .text()
    .then((text) => parseReadLog(text, options));
}
