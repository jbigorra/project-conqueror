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

function parseSvnDate(dateStr: string): string {
  const m = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) throw new Error(`Cannot parse SVN date: ${dateStr}`);
  return m[1]!;
}

export function parseXml(xmlText: string): SvnLogEntry[] {
  const entries: SvnLogEntry[] = [];
  let m: RegExpExecArray | null;

  LOGENTRY_RE.lastIndex = 0;
  while ((m = LOGENTRY_RE.exec(xmlText)) !== null) {
    const rev = m[1]!;
    const body = m[2]!;

    const authorM = AUTHOR_RE.exec(body);
    const dateM = DATE_RE.exec(body);
    const author = authorM ? authorM[1]!.trim() : "";
    const date = dateM ? parseSvnDate(dateM[1]!.trim()) : "";

    const paths: Array<{ entity: string; action: string }> = [];
    PATH_RE.lastIndex = 0;
    let pm: RegExpExecArray | null;
    while ((pm = PATH_RE.exec(body)) !== null) {
      paths.push({ action: pm[1]!, entity: pm[2]!.trim() });
    }

    entries.push({ rev, author, date, paths });
  }

  return entries;
}

export function asRows(logEntry: SvnLogEntry): SvnEntry[] {
  return logEntry.paths.map(({ entity, action }) => ({
    entity,
    date: logEntry.date,
    author: logEntry.author,
    action,
    rev: logEntry.rev,
  }));
}

export function parseLog(xmlText: string, _options: Record<string, unknown> = {}): SvnEntry[] {
  return parseXml(xmlText).flatMap(asRows);
}

export function parseReadLog(text: string, options: Record<string, unknown> = {}): SvnEntry[] {
  if (!text.trim()) return [];
  return parseLog(text, options);
}
