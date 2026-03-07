import type { VCSEntry } from "../types";

export type ParsedEntry = Omit<VCSEntry, "rev"> & { rev: string };

// Commit header: --{hash}--{YYYY-MM-dd}--{author}
const COMMIT_HEADER = /^--([0-9a-f]+)--(\d{4}-\d{2}-\d{2})--(.+)$/;
// File stat line: {added}\t{deleted}\t{path}  (binary files use "-" for added/deleted)
const FILE_LINE = /^(-|\d+)\t(-|\d+)\t(.+)$/;

export function parseReadLog(text: string, _options: Record<string, unknown>): ParsedEntry[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const result: ParsedEntry[] = [];
  let currentRev: string | undefined;
  let currentDate: string | undefined;
  let currentAuthor: string | undefined;

  for (const line of lines) {
    const headerMatch = line.match(COMMIT_HEADER);
    if (headerMatch) {
      currentRev = headerMatch[1]!;
      currentDate = headerMatch[2]!;
      currentAuthor = headerMatch[3]!;
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
        message: "-",
      });
    }
  }

  return result;
}

export function parseLog(filePath: string, options: Record<string, unknown>): Promise<ParsedEntry[]> {
  return Bun.file(filePath).text().then(text => parseReadLog(text, options));
}
