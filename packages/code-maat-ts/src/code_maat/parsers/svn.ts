/** A flat VCS entry parsed from an SVN XML log, one row per (revision x file) pair. */
export type SvnEntry = {
  /** Author who committed the revision. */
  author: string;
  /** SVN revision number as a string. */
  rev: string;
  /** Commit date in `YYYY-MM-DD` format. */
  date: string;
  /** Full repository path of the changed file. */
  entity: string;
  /** SVN action code: `"M"` (modified), `"A"` (added), `"D"` (deleted), or `"R"` (replaced). */
  action: string;
};

/** A structured SVN log entry grouping all changed paths under a single revision. */
export type SvnLogEntry = {
  /** SVN revision number as a string. */
  rev: string;
  /** Author who committed the revision. */
  author: string;
  /** Commit date in `YYYY-MM-DD` format. */
  date: string;
  /** Files changed in this revision, each with its entity path and action code. */
  paths: Array<{ entity: string; action: string }>;
};

// Regex-based XML parsing for the predictable SVN log format
const AUTHOR_RE = /<author>([\s\S]*?)<\/author>/;
const DATE_RE = /<date>([\s\S]*?)<\/date>/;

function getCapture(match: RegExpMatchArray, index: number, context: string): string {
  const value = match[index];
  if (value === undefined) {
    throw new Error(`Malformed SVN log: missing ${context}`);
  }
  return value;
}

function logEntryMatches(xmlText: string): RegExpMatchArray[] {
  return Array.from(xmlText.matchAll(/<logentry\s+revision='(\d+)'>([\s\S]*?)<\/logentry>/g));
}

function pathMatches(body: string): RegExpMatchArray[] {
  return Array.from(body.matchAll(/<path[^>]+action='([^']+)'[^>]*>([\s\S]*?)<\/path>/g));
}

function parsePaths(body: string): Array<{ entity: string; action: string }> {
  return pathMatches(body).map((match) => ({
    action: getCapture(match, 1, "path action"),
    entity: getCapture(match, 2, "path entity").trim(),
  }));
}

function parseSvnDate(dateStr: string): string {
  const m = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) throw new Error(`Cannot parse SVN date: ${dateStr}`);
  return getCapture(m, 1, "date");
}

/**
 * Parses SVN XML log text into structured log entries.
 *
 * Performs regex-based XML parsing on the predictable SVN log format produced by
 * `svn log --xml --verbose`. Each `SvnLogEntry` groups all file paths changed in
 * a single revision under one object.
 *
 * @param xmlText - Raw XML text from `svn log --xml --verbose`.
 * @returns Array of `SvnLogEntry` objects, one per SVN revision.
 *
 * @example
 * const text = await Bun.file("tests/fixtures/log-fixtures/statsvn.log").text();
 * parseXml(text);
 * // [{ rev: "406", author: "benoitx", date: "2010-04-11", paths: [{ entity: "/trunk/statsvn/site/changes.xml", action: "M" }, ...] }, ...]
 */
export function parseXml(xmlText: string): SvnLogEntry[] {
  const entries: SvnLogEntry[] = [];
  for (const match of logEntryMatches(xmlText)) {
    const rev = getCapture(match, 1, "revision");
    const body = getCapture(match, 2, "entry body");

    const authorM = AUTHOR_RE.exec(body);
    const dateM = DATE_RE.exec(body);
    const author = authorM ? getCapture(authorM, 1, "author").trim() : "";
    const date = dateM ? parseSvnDate(getCapture(dateM, 1, "date body").trim()) : "";
    const paths = parsePaths(body);

    entries.push({ rev, author, date, paths });
  }

  return entries;
}

/**
 * Flattens a single `SvnLogEntry` into one `SvnEntry` row per changed file path.
 *
 * @param logEntry - A structured SVN log entry for one revision.
 * @returns Array of `SvnEntry` objects, one per file path in the revision.
 *
 * @example
 * asRows({ rev: "406", author: "benoitx", date: "2010-04-11", paths: [{ entity: "/trunk/statsvn/site/changes.xml", action: "M" }] });
 * // [{ entity: "/trunk/statsvn/site/changes.xml", date: "2010-04-11", author: "benoitx", action: "M", rev: "406" }]
 */
export function asRows(logEntry: SvnLogEntry): SvnEntry[] {
  return logEntry.paths.map(({ entity, action }) => ({
    entity,
    date: logEntry.date,
    author: logEntry.author,
    action,
    rev: logEntry.rev,
  }));
}

/**
 * Parses an SVN XML log string into an array of flat VCS entries.
 *
 * Combines {@link parseXml} and {@link asRows} to produce one entry per
 * (revision × file) pair. This is the primary entry point for SVN log parsing.
 *
 * @param xmlText - Raw XML text from `svn log --xml --verbose`.
 * @param _options - Reserved for future use; pass `{}`.
 * @returns Array of `SvnEntry` objects, one per (revision × file) pair.
 *
 * @example
 * const text = await Bun.file("tests/fixtures/log-fixtures/statsvn.log").text();
 * parseLog(text, {});
 * // [{ author: "benoitx", entity: "/trunk/statsvn/site/changes.xml", rev: "406", date: "2010-04-11", action: "M" }, ...]
 */
export function parseLog(xmlText: string, _options: Record<string, unknown> = {}): SvnEntry[] {
  return parseXml(xmlText).flatMap(asRows);
}

/**
 * Parses an SVN XML log string into an array of flat VCS entries.
 *
 * Guard wrapper around {@link parseLog} that returns an empty array for blank input.
 * Prefer this function when reading log text from an unknown source.
 *
 * @param text - Raw XML text from `svn log --xml --verbose`.
 * @param options - Reserved for future use; pass `{}`.
 * @returns Array of `SvnEntry` objects, one per (revision × file) pair.
 *
 * @example
 * const text = await Bun.file("tests/fixtures/log-fixtures/statsvn.log").text();
 * parseReadLog(text, {});
 * // [{ author: "benoitx", entity: "/trunk/statsvn/site/changes.xml", rev: "406", date: "2010-04-11", action: "M" }, ...]
 */
export function parseReadLog(text: string, options: Record<string, unknown> = {}): SvnEntry[] {
  if (!text.trim()) return [];
  return parseLog(text, options);
}
