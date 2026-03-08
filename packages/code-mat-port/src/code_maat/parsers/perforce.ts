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

export function parseLog(
  filePath: string,
  options: Record<string, unknown>,
): Promise<PerforceEntry[]> {
  return Bun.file(filePath)
    .text()
    .then((text) => parseReadLog(text, options));
}
