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

export function parseLog(filePath: string, options: Record<string, unknown>): Promise<MercurialEntry[]> {
  return Bun.file(filePath).text().then(text => parseReadLog(text, options));
}
