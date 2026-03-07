export type TfsEntry = {
  author: string;
  rev: string;
  date: string;
  entity: string;
  message: string;
};

type TfsState = "IDLE" | "HEADER" | "COMMENT" | "ITEMS" | "SKIP";

const SEP = /^-{3,}$/;
const CHANGESET = /^Changeset:\s+(\d+)$/;
const USER = /^User:\s+(.+)$/;
const PROXY = /^Checked in by:/;
const DATE_LINE = /^Date:\s+(.+)$/;
const COMMENT_HEADER = /^Comment:$/;
const ITEMS_HEADER = /^Items:$/;
const NOTES_HEADER = /^Check-in Notes:/;
const POLICY_HEADER = /^Policy Warnings:/;
// Item line: "  add $/path" or "  edit $/path/to/file"
const ITEM_LINE = /^\s+\S[\s\S]*?\$(.+)$/;
// Comment line: 2-space indent
const COMMENT_LINE = /^  (.+)$/;

const MONTH_MAP: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

// Parses EN-US format: "Thursday, July 23, 2015 4:34:31 PM"
function parseDate(dateStr: string): string {
  // Optional "DayName, " prefix, then "Month D, YYYY ..."
  const m = dateStr.match(/^(?:\w+,\s+)?([A-Za-z]+)\s+(\d+),\s+(\d{4})\s+/);
  if (!m) throw new Error(`Unsupported TFS Date Format: ${dateStr}`);
  const month = MONTH_MAP[m[1]!];
  if (!month) throw new Error(`Unsupported TFS Date Format: ${dateStr}`);
  const day = m[2]!.padStart(2, "0");
  return `${m[3]!}-${month}-${day}`;
}

export function parseReadLog(text: string, _options: Record<string, unknown> = {}): TfsEntry[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const result: TfsEntry[] = [];

  let state: TfsState = "IDLE";
  let rev = "";
  let author = "";
  let date = "";
  let messageLines: string[] = [];
  let entities: string[] = [];

  function flush() {
    if (!rev || entities.length === 0) return;
    const message = messageLines.join("\n");
    for (const entity of entities) {
      result.push({ author, rev, date, entity, message });
    }
  }

  function reset() {
    rev = ""; author = ""; date = ""; messageLines = []; entities = [];
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trimEnd();

    if (SEP.test(trimmed)) {
      flush();
      reset();
      state = "HEADER";
      continue;
    }

    if (state === "HEADER") {
      const cm = trimmed.match(CHANGESET);
      if (cm) { rev = cm[1]!; continue; }

      const um = trimmed.match(USER);
      if (um) { author = um[1]!; continue; }

      if (PROXY.test(trimmed)) continue;

      const dm = trimmed.match(DATE_LINE);
      if (dm) { date = parseDate(dm[1]!); continue; }

      if (COMMENT_HEADER.test(trimmed)) { state = "COMMENT"; continue; }
      // blank line or other header lines → skip
      continue;
    }

    if (state === "COMMENT") {
      if (ITEMS_HEADER.test(trimmed)) { state = "ITEMS"; continue; }
      if (!trimmed) continue; // blank line within comment
      const lm = rawLine.match(COMMENT_LINE);
      if (lm) { messageLines.push(lm[1]!); continue; }
      continue;
    }

    if (state === "ITEMS") {
      if (NOTES_HEADER.test(trimmed)) { state = "SKIP"; continue; }
      if (POLICY_HEADER.test(trimmed)) { state = "SKIP"; continue; }
      if (!trimmed) continue;
      const im = rawLine.match(ITEM_LINE);
      if (im) { entities.push(im[1]!); continue; }
      continue;
    }

    // state === "SKIP" or "IDLE": do nothing
  }

  flush();
  return result;
}

export function parseLog(filePath: string, options: Record<string, unknown>): Promise<TfsEntry[]> {
  return Bun.file(filePath).text().then(text => parseReadLog(text, options));
}
