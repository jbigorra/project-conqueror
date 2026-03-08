import type { VCSEntry } from "../types";

export type ParsedEntry = Omit<VCSEntry, "rev"> & { rev: string };

// [hash] author YYYY-MM-dd message
// Author uses lazy match to stop at the FIRST date-like field, so dates in messages are ignored
const COMMIT_HEADER = /^\[([0-9a-f]+)\]\s+(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(.*)$/;
const FILE_LINE = /^(-|\d+)\t(-|\d+)\t(.+)$/;

export function parseReadLog(text: string, _options: Record<string, unknown>): ParsedEntry[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const result: ParsedEntry[] = [];
  let currentRev: string | undefined;
  let currentDate: string | undefined;
  let currentAuthor: string | undefined;
  let currentMessage: string | undefined;

  for (const line of lines) {
    const headerMatch = line.match(COMMIT_HEADER);
    if (headerMatch) {
      currentRev = headerMatch[1]!;
      currentAuthor = headerMatch[2]!;
      currentDate = headerMatch[3]!;
      currentMessage = headerMatch[4]!;
      continue;
    }

    const fileMatch = line.match(FILE_LINE);
    if (fileMatch && currentRev) {
      result.push({
        locAdded: fileMatch[1]!,
        locDeleted: fileMatch[2]!,
        entity: fileMatch[3]!,
        rev: currentRev,
        date: currentDate!,
        author: currentAuthor!,
        message: currentMessage ?? "-",
      });
    }
  }

  return result;
}

export function parseLog(
  filePath: string,
  options: Record<string, unknown>,
): Promise<ParsedEntry[]> {
  return Bun.file(filePath)
    .text()
    .then((text) => parseReadLog(text, options));
}
