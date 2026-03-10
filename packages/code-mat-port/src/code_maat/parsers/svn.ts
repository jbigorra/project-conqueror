export type SvnEntry = {
  author: string;
  rev: string;
  date: string;
  entity: string;
  action: string;
};

export type SvnLogEntry = {
  rev: string;
  author: string;
  date: string;
  paths: Array<{ entity: string; action: string }>;
};

// Regex-based XML parsing for the predictable SVN log format
const LOGENTRY_RE = /<logentry\s+revision='(\d+)'>([\s\S]*?)<\/logentry>/g;
const AUTHOR_RE = /<author>([\s\S]*?)<\/author>/;
const DATE_RE = /<date>([\s\S]*?)<\/date>/;
const PATH_RE = /<path[^>]+action='([^']+)'[^>]*>([\s\S]*?)<\/path>/g;

function getCapture(
  match: RegExpMatchArray | RegExpExecArray,
  index: number,
  context: string,
): string {
  const value = match[index];
  if (value === undefined) {
    throw new Error(`Malformed SVN log: missing ${context}`);
  }
  return value;
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
  let m: RegExpExecArray | null;

  LOGENTRY_RE.lastIndex = 0;
  m = LOGENTRY_RE.exec(xmlText);
  while (m !== null) {
    const rev = getCapture(m, 1, "revision");
    const body = getCapture(m, 2, "entry body");

    const authorM = AUTHOR_RE.exec(body);
    const dateM = DATE_RE.exec(body);
    const author = authorM ? getCapture(authorM, 1, "author").trim() : "";
    const date = dateM ? parseSvnDate(getCapture(dateM, 1, "date body").trim()) : "";

    const paths: Array<{ entity: string; action: string }> = [];
    PATH_RE.lastIndex = 0;
    let pm: RegExpExecArray | null = PATH_RE.exec(body);
    while (pm !== null) {
      const action = getCapture(pm, 1, "path action");
      const entity = getCapture(pm, 2, "path entity");
      paths.push({ action, entity: entity.trim() });
      pm = PATH_RE.exec(body);
    }

    entries.push({ rev, author, date, paths });
    m = LOGENTRY_RE.exec(xmlText);
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
